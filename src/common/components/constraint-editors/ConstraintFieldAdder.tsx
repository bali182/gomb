import {
  Box,
  Combobox,
  Grid,
  HStack,
  Icon,
  Portal,
  TagsInput,
  Text,
  createListCollection,
  useCombobox,
  useFilter,
  useTagsInput,
  type ListCollection,
} from '@chakra-ui/react'
import { useCallback, useEffect, useId, useMemo, useState, type FC } from 'react'
import { PiPlus } from 'react-icons/pi'
import { useEditorContext } from '../../contexts/EditorContext'
import { constraintFieldCompatibility } from '../../data/constraintFieldCompatibility'
import { useSubProject } from '../../hooks/useSubProject'
import { useSubProjectOperations } from '../../hooks/useSubProjectOperations'
import { useTranslation } from '../../hooks/useTranslation'
import { constraintFieldBlockers } from '../../logic/constraints/constraintFieldBlockers'
import { portalRef } from '../../portalRef'
import type { SubProjectAccessorSchema } from '../../schemas/accessors'
import type { ConstraintFieldNameSchema, ConstraintSchema } from '../../schemas/constraints'
import type { ConstraintFieldInputSchema } from '../../schemas/factory'
import type { ModelObjectSchema, ModelObjectTypeSchema } from '../../schemas/modelObject'
import { accessors } from '../../utils/accessors'
import { getModelIcon } from '../../utils/getModelIcon'
import { isDefined } from '../../utils/isDefined'
import { narrowers } from '../../utils/narrowers'
import { EditorButton } from '../common/EditorButton'
import { TooltipIcon } from '../common/TooltipIcon'
import type { ConstraintFieldAdderState } from './constraintFieldUtils'
import { getConstraintFieldInputs, getConstraintFieldLabel } from './constraintFieldUtils'

type ConstraintModelChoice = {
  id: string
  label: string
  model: ModelObjectSchema
}

type ConstraintPropertyChoice = {
  id: ConstraintFieldNameSchema
  label: string
  fields: ConstraintFieldInputSchema[]
}

type ConstraintFieldAdderProps = {
  constraint: ConstraintSchema
}

export const ConstraintFieldAdder: FC<ConstraintFieldAdderProps> = ({ constraint }) => {
  const { subProject } = useSubProject()
  const { isComputing, setEditingInputId } = useEditorContext()
  const { addConstraintFields } = useSubProjectOperations()
  const { t } = useTranslation()
  const [{ modelIds, property }, setSelection] = useState<ConstraintFieldAdderState>({
    modelIds: [],
    property: undefined,
  })
  const accessor = useMemo<SubProjectAccessorSchema>(() => accessors.subProject(subProject), [subProject])

  const getFields = useCallback(
    (model: ModelObjectSchema): ConstraintFieldInputSchema[] =>
      getConstraintFieldInputs(model).filter((field) => {
        const group = constraintFieldCompatibility[model.type][field.field]
        if (
          !isDefined(group) ||
          accessor.constraint.byField(field.modelId, field.field).length > 0 ||
          isDefined(constraintFieldBlockers[model.type][field.field]?.(model))
        ) {
          return false
        }
        return constraint.fields.every((member) => {
          const memberModel = accessor.optional.constraint.model(member)
          return isDefined(memberModel) && constraintFieldCompatibility[memberModel.type][member.field] === group
        })
      }),
    [accessor, constraint.fields],
  )

  const modelChoices = useMemo<ConstraintModelChoice[]>(() => {
    const models = [
      ...Object.values(subProject.components),
      ...subProject.holes,
      ...subProject.stitchLines,
      ...Object.values(subProject.pocketOpenings),
    ]
    return models
      .filter((model) => getFields(model).length > 0)
      .map(
        (model): ConstraintModelChoice => ({
          id: model.id,
          model,
          label: narrowers.is.constraint(model) ? '' : model.name,
        }),
      )
  }, [getFields, subProject])

  const getProperties = useCallback(
    (selected: ConstraintModelChoice[]): ConstraintPropertyChoice[] => {
      const first = selected[0]
      if (!isDefined(first)) {
        return []
      }
      const available = selected.map((item) => getFields(item.model))
      return getFields(first.model).flatMap((field): ConstraintPropertyChoice[] => {
        const group = constraintFieldCompatibility[first.model.type][field.field]
        const fields: ConstraintFieldInputSchema[] = []
        for (const inputs of available) {
          const input = inputs.find((input) => input.field === field.field)
          if (!isDefined(input)) {
            return []
          }
          fields.push(input)
        }
        if (!selected.every((item) => constraintFieldCompatibility[item.model.type][field.field] === group)) {
          return []
        }
        return [{ id: field.field, label: getConstraintFieldLabel(field.field, t), fields }]
      })
    },
    [getFields, t],
  )

  const properties = useMemo<ConstraintPropertyChoice[]>(() => {
    const selected = modelIds.map((id) => modelChoices.find((item) => item.id === id))
    if (!selected.every(isDefined)) {
      return []
    }
    return getProperties(selected)
  }, [getProperties, modelChoices, modelIds])
  const selectedProperty = properties.find((item) => item.id === property)

  const handleModelsChange = useCallback(
    (ids: string[]): void => {
      const selected = modelChoices.filter((item) => ids.includes(item.id))
      setSelection({
        modelIds: ids,
        property: getProperties(selected).some((item) => item.id === property) ? property : undefined,
      })
    },
    [getProperties, modelChoices, property],
  )

  const handlePropertyChange = useCallback((property: ConstraintFieldNameSchema | undefined): void => {
    setSelection((selection) => ({ ...selection, property }))
  }, [])

  const handleAdd = useCallback((): void => {
    if (isComputing || !isDefined(selectedProperty)) {
      return
    }
    setEditingInputId(undefined)
    addConstraintFields(constraint.id, selectedProperty.fields)
    setSelection({ modelIds: [], property: undefined })
  }, [addConstraintFields, constraint.id, isComputing, selectedProperty, setEditingInputId])

  return (
    <Box bg="bg.muted" borderWidth="1px" borderRadius="md" p="3">
      <Grid templateColumns="max-content minmax(0, 1fr)" columnGap="3" rowGap="3">
        <Text gridColumn="1 / -1" textStyle="sm" fontWeight="bold">
          {t.project.editors.sections.constraints.addFields.title}
        </Text>
        <HStack gap="1" alignSelf="center">
          <Text color="fg.muted" textStyle="sm">
            {t.project.editors.sections.constraints.addFields.modelIds.label}
          </Text>
          <TooltipIcon content={t.project.editors.sections.constraints.addFields.modelIds.tooltip} severity="info" />
        </HStack>
        <Box minW="0">
          <ConstraintModelCombobox choices={modelChoices} value={modelIds} onChange={handleModelsChange} />
        </Box>
        <HStack gap="1" alignSelf="center">
          <Text color="fg.muted" textStyle="sm">
            {t.project.editors.sections.constraints.addFields.property.label}
          </Text>
          <TooltipIcon content={t.project.editors.sections.constraints.addFields.property.tooltip} severity="info" />
        </HStack>
        <Box minW="0">
          <ConstraintPropertyCombobox
            choices={properties}
            value={selectedProperty?.id}
            onChange={handlePropertyChange}
          />
        </Box>
        <HStack gridColumn="1 / -1" justify="flex-end">
          <EditorButton size="2xs" readOnly={isComputing} disabled={!isDefined(selectedProperty)} onClick={handleAdd}>
            <PiPlus />
            {t.project.editors.sections.constraints.addFields.add}
          </EditorButton>
        </HStack>
      </Grid>
    </Box>
  )
}

type ConstraintModelComboboxProps = {
  choices: ConstraintModelChoice[]
  value: string[]
  onChange: (ids: string[]) => void
}

const ConstraintModelCombobox: FC<ConstraintModelComboboxProps> = ({ choices, value, onChange }) => {
  const { subProject } = useSubProject()
  const { isComputing, setEditingInputId } = useEditorContext()
  const { t } = useTranslation()
  const [search, setSearch] = useState<string>('')
  const { contains } = useFilter({ sensitivity: 'base' })
  const filtered = useMemo<ConstraintModelChoice[]>(
    () => choices.filter((item) => contains(item.label, search)),
    [choices, contains, search],
  )
  const collection = useMemo<ListCollection<ConstraintModelChoice>>(
    () =>
      createListCollection({
        items: filtered,
        itemToString: (item) => item.label,
        itemToValue: (item) => item.id,
      }),
    [filtered],
  )
  const modelTypes = useMemo<ModelObjectTypeSchema[]>(
    () => Array.from(new Set(filtered.map((item) => item.model.type))),
    [filtered],
  )
  const id = useId()
  const ids = { input: `${id}:input`, control: `${id}:control` }
  const tags = useTagsInput({
    ids,
    value,
    inputValue: search,
    readOnly: isComputing,
    editable: false,
    validate: (details) => choices.some((item) => item.id === details.inputValue),
    onValueChange: (details) => {
      if (!isComputing) {
        setEditingInputId(undefined)
        onChange(details.value)
      }
    },
    onInputValueChange: (details) => setSearch(details.inputValue),
  })
  const combobox = useCombobox<ConstraintModelChoice>({
    ids,
    collection,
    multiple: true,
    value,
    inputValue: search,
    openOnClick: true,
    closeOnSelect: false,
    selectionBehavior: 'clear',
    readOnly: isComputing,
    onValueChange: (details) => {
      if (!isComputing) {
        setEditingInputId(undefined)
        onChange(details.value)
      }
    },
    onInputValueChange: (details) => setSearch(details.inputValue),
  })

  useEffect(() => {
    if (value.length === 0) {
      setSearch('')
    }
  }, [value])

  return (
    <Combobox.RootProvider value={combobox} size="sm">
      <TagsInput.RootProvider value={tags} size="sm">
        <Combobox.Control asChild>
          <TagsInput.Control bg="bg.panel">
            {value.map((id, index) => {
              const item = choices.find((item) => item.id === id)
              if (!isDefined(item)) {
                return null
              }
              return (
                <TagsInput.Item key={id} index={index} value={id}>
                  <TagsInput.ItemPreview>
                    <TagsInput.ItemText>{item.label}</TagsInput.ItemText>
                    <TagsInput.ItemDeleteTrigger />
                  </TagsInput.ItemPreview>
                </TagsInput.Item>
              )
            })}
            <Combobox.Input unstyled asChild>
              <TagsInput.Input placeholder={t.project.editors.sections.constraints.addFields.modelIds.placeholder} />
            </Combobox.Input>
            <Combobox.Trigger />
          </TagsInput.Control>
        </Combobox.Control>
        <Portal container={portalRef}>
          <Combobox.Positioner>
            <Combobox.Content maxH="72" overflowY="auto">
              <Combobox.Empty>{t.project.editors.sections.constraints.addFields.noMatches}</Combobox.Empty>
              <Combobox.List>
                {modelTypes.map((type) => (
                  <Combobox.ItemGroup key={type}>
                    <Combobox.ItemGroupLabel>
                      {t.project.editors.enums.constraints.modelTypesPlural[type]}
                    </Combobox.ItemGroupLabel>
                    {filtered
                      .filter((item) => item.model.type === type)
                      .map((item) => (
                        <Combobox.Item key={item.id} item={item}>
                          <HStack gap="2">
                            <Icon as={getModelIcon(item.model, subProject)} />
                            <Combobox.ItemText>{item.label}</Combobox.ItemText>
                          </HStack>
                          <Combobox.ItemIndicator />
                        </Combobox.Item>
                      ))}
                  </Combobox.ItemGroup>
                ))}
              </Combobox.List>
            </Combobox.Content>
          </Combobox.Positioner>
        </Portal>
      </TagsInput.RootProvider>
    </Combobox.RootProvider>
  )
}

type ConstraintPropertyComboboxProps = {
  choices: ConstraintPropertyChoice[]
  value: ConstraintFieldNameSchema | undefined
  onChange: (property: ConstraintFieldNameSchema | undefined) => void
}

const ConstraintPropertyCombobox: FC<ConstraintPropertyComboboxProps> = ({ choices, value, onChange }) => {
  const { isComputing, setEditingInputId } = useEditorContext()
  const { t } = useTranslation()
  const [search, setSearch] = useState<string>('')
  const { contains } = useFilter({ sensitivity: 'base' })
  const filtered = useMemo<ConstraintPropertyChoice[]>(
    () => choices.filter((item) => contains(item.label, search)),
    [choices, contains, search],
  )
  const collection = useMemo<ListCollection<ConstraintPropertyChoice>>(
    () =>
      createListCollection({
        items: filtered,
        itemToString: (item) => item.label,
        itemToValue: (item) => item.id,
      }),
    [filtered],
  )

  useEffect(() => {
    if (!isDefined(value)) {
      setSearch('')
    }
  }, [value])

  return (
    <Combobox.Root<ConstraintPropertyChoice>
      collection={collection}
      value={isDefined(value) ? [value] : []}
      inputValue={search}
      openOnClick
      readOnly={isComputing}
      size="sm"
      onValueChange={(details) => {
        if (!isComputing) {
          setEditingInputId(undefined)
          onChange(details.items[0]?.id)
        }
      }}
      onInputValueChange={(details) => setSearch(details.inputValue)}
    >
      <Combobox.Control>
        <Combobox.Input
          bg="bg.panel"
          placeholder={t.project.editors.sections.constraints.addFields.property.placeholder}
        />
        <Combobox.IndicatorGroup>
          <Combobox.Trigger />
        </Combobox.IndicatorGroup>
      </Combobox.Control>
      <Portal container={portalRef}>
        <Combobox.Positioner>
          <Combobox.Content maxH="72" overflowY="auto">
            <Combobox.Empty>{t.project.editors.sections.constraints.addFields.noMatches}</Combobox.Empty>
            <Combobox.List>
              {filtered.map((item) => (
                <Combobox.Item key={item.id} item={item}>
                  <Combobox.ItemText>{item.label}</Combobox.ItemText>
                  <Combobox.ItemIndicator />
                </Combobox.Item>
              ))}
            </Combobox.List>
          </Combobox.Content>
        </Combobox.Positioner>
      </Portal>
    </Combobox.Root>
  )
}
