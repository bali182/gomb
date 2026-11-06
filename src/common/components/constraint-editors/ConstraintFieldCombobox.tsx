import {
  Box,
  Combobox,
  HStack,
  Icon,
  Portal,
  Tag,
  Text,
  createListCollection,
  useFilter,
  type ComboboxValueChangeDetails,
  type ListCollection,
} from '@chakra-ui/react'
import { useCallback, useMemo, useState, type FC } from 'react'
import { PiArrowRight, PiX } from 'react-icons/pi'
import { useEditorContext } from '../../contexts/EditorContext'
import { constraintFieldCompatibility } from '../../data/constraintFieldCompatibility'
import { useSubProject } from '../../hooks/useSubProject'
import { useSubProjectOperations } from '../../hooks/useSubProjectOperations'
import { useTranslation } from '../../hooks/useTranslation'
import { constraintFieldBlockers } from '../../logic/constraints/constraintFieldBlockers'
import { portalRef } from '../../portalRef'
import type { SubProjectAccessorSchema } from '../../schemas/accessors'
import type { ConstraintFieldBlockReasonSchema, ConstraintSchema } from '../../schemas/constraints'
import type { ConstraintFieldInputSchema } from '../../schemas/factory'
import type { ModelObjectSchema, ModelObjectTypeSchema } from '../../schemas/modelObject'
import { accessors } from '../../utils/accessors'
import { getModelIcon } from '../../utils/getModelIcon'
import { isDefined } from '../../utils/isDefined'
import { narrowers } from '../../utils/narrowers'
import { getConstraintFieldInputs, getConstraintFieldLabel } from './constraintFieldUtils'

type ConstraintModelChoice = {
  kind: 'model'
  id: string
  label: string
  model: ModelObjectSchema
}
type ConstraintFieldChoice = {
  kind: 'field'
  id: string
  label: string
  field: ConstraintFieldInputSchema
  disabledReason?: ConstraintFieldBlockReasonSchema
}
type ConstraintChoice = ConstraintModelChoice | ConstraintFieldChoice
type ConstraintFieldComboboxProps = { constraint: ConstraintSchema }

export const ConstraintFieldCombobox: FC<ConstraintFieldComboboxProps> = ({ constraint }) => {
  const { subProject } = useSubProject()
  const { isComputing, setEditingInputId } = useEditorContext()
  const { addConstraintField } = useSubProjectOperations()
  const { t } = useTranslation()
  const [model, setModel] = useState<ModelObjectSchema | undefined>()
  const [search, setSearch] = useState<string>('')
  const [open, setOpen] = useState<boolean>(false)
  const { contains } = useFilter({ sensitivity: 'base' })
  const accessor = useMemo<SubProjectAccessorSchema>(() => accessors.subProject(subProject), [subProject])

  const getFields = useCallback(
    (candidateModel: ModelObjectSchema): ConstraintFieldChoice[] => {
      return getConstraintFieldInputs(candidateModel)
        .filter((field) => {
          const group = constraintFieldCompatibility[candidateModel.type][field.field]
          if (!isDefined(group) || accessor.constraint.byField(field.modelId, field.field).length > 0) {
            return false
          }
          return constraint.fields.every((member) => {
            const memberModel = accessor.optional.constraint.model(member)
            return isDefined(memberModel) && constraintFieldCompatibility[memberModel.type][member.field] === group
          })
        })
        .map(
          (field): ConstraintFieldChoice => ({
            kind: 'field',
            id: `${field.type}:${field.modelId}:${field.field}`,
            label: getConstraintFieldLabel(field.field, t),
            field,
            disabledReason: constraintFieldBlockers[candidateModel.type][field.field]?.(candidateModel),
          }),
        )
    },
    [accessor, constraint.fields, t],
  )

  const modelChoices = useMemo<ConstraintModelChoice[]>(() => {
    const models = [
      ...Object.values(subProject.components),
      ...subProject.holes,
      ...subProject.stitchLines,
      ...Object.values(subProject.pocketOpenings),
    ]
    const items = models
      .filter((item) => getFields(item).length > 0)
      .map(
        (item): ConstraintModelChoice => ({
          kind: 'model',
          id: `${item.type}:${item.id}`,
          model: item,
          label: item.name,
        }),
      )
    return Array.from(new Set(items.map((item) => item.model.type))).flatMap((type) =>
      items.filter((item) => item.model.type === type),
    )
  }, [getFields, subProject])

  const modelTypes: ModelObjectTypeSchema[] = Array.from(new Set(modelChoices.map((item) => item.model.type)))

  const currentModel = isDefined(model) ? modelChoices.find((item) => item.model.id === model.id)?.model : undefined

  const choices = useMemo<ConstraintChoice[]>(() => {
    const items = isDefined(currentModel) ? getFields(currentModel) : modelChoices
    return items.filter((item) => contains(item.label, search))
  }, [contains, currentModel, getFields, modelChoices, search])

  const collection = useMemo<ListCollection<ConstraintChoice>>(
    () =>
      createListCollection<ConstraintChoice>({
        items: choices,
        itemToString: (item) => item.label,
        itemToValue: (item) => item.id,
        isItemDisabled: (item) => item.kind === 'field' && isDefined(item.disabledReason),
      }),
    [choices],
  )

  const handleValueChange = useCallback(
    (details: ComboboxValueChangeDetails<ConstraintChoice>): void => {
      const item = details.items[0]
      if (!isDefined(item) || isComputing) {
        return
      }
      setEditingInputId(undefined)
      if (item.kind === 'model') {
        setModel(item.model)
        setSearch('')
        setOpen(true)
      } else if (!isDefined(item.disabledReason)) {
        addConstraintField(constraint.id, item.field)
        setModel(undefined)
        setSearch('')
        setOpen(false)
      }
    },
    [addConstraintField, constraint.id, isComputing, setEditingInputId],
  )

  const handleInputChange = useCallback((details: Combobox.InputValueChangeDetails): void => {
    if (details.reason === 'input-change') {
      setSearch(details.inputValue)
    }
  }, [])

  const handleReset = useCallback((): void => {
    setModel(undefined)
    setSearch('')
    setOpen(true)
  }, [])

  return (
    <Combobox.Root<ConstraintChoice>
      collection={collection}
      value={[]}
      inputValue={search}
      open={open}
      openOnClick
      closeOnSelect={false}
      readOnly={isComputing}
      size="sm"
      onValueChange={handleValueChange}
      onInputValueChange={handleInputChange}
      onOpenChange={(details) => setOpen(details.open)}
    >
      <Combobox.Control
        display="flex"
        alignItems="center"
        borderWidth="1px"
        borderRadius="md"
        gap="1"
        minW="0"
        bg="bg.panel"
        _focusWithin={{
          outline: '2px solid',
          outlineColor: 'colorPalette.focusRing',
          outlineOffset: '-1px',
          borderColor: 'colorPalette.focusRing',
        }}
      >
        {isDefined(currentModel) && (
          <>
            <Tag.Root size="sm" maxW="48" ms="2">
              <Tag.Label truncate>{narrowers.is.constraint(currentModel) ? '' : currentModel.name}</Tag.Label>
              <Tag.EndElement>
                <Tag.CloseTrigger onClick={handleReset} focusRing="none">
                  <PiX />
                </Tag.CloseTrigger>
              </Tag.EndElement>
            </Tag.Root>
            <Box flexShrink="0">
              <PiArrowRight />
            </Box>
          </>
        )}
        <Combobox.Input
          flex="1"
          minW="0"
          width="0"
          border="0"
          ps="2"
          pe="2"
          bg="transparent"
          focusRing="none"
          boxShadow="none"
          _focus={{ outline: 'none', boxShadow: 'none' }}
          _focusVisible={{ outline: 'none', boxShadow: 'none' }}
          placeholder={
            isDefined(currentModel)
              ? t.project.editors.sections.constraints.selectField
              : t.project.editors.sections.constraints.selectModel
          }
        />
        <Combobox.IndicatorGroup position="static" alignSelf="stretch" flexShrink="0" px="0" width="9">
          <Combobox.Trigger width="full" height="full" focusRing="none" />
        </Combobox.IndicatorGroup>
      </Combobox.Control>
      <Portal container={portalRef}>
        <Combobox.Positioner>
          <Combobox.Content maxH="72" overflowY="auto">
            <Combobox.Empty>{t.project.editors.sections.constraints.noMatches}</Combobox.Empty>
            <Combobox.List>
              {isDefined(currentModel)
                ? choices.map(
                    (item) =>
                      item.kind === 'field' && (
                        <Combobox.Item key={item.id} item={item}>
                          <Combobox.ItemText>{item.label}</Combobox.ItemText>
                          {isDefined(item.disabledReason) && (
                            <Text textStyle="2xs" color="fg.muted">
                              {t.project.editors.enums.constraints.blockReason[item.disabledReason]}
                            </Text>
                          )}
                        </Combobox.Item>
                      ),
                  )
                : modelTypes.map((type) => {
                    const items = choices.filter(
                      (item): item is ConstraintModelChoice => item.kind === 'model' && item.model.type === type,
                    )
                    return (
                      items.length > 0 && (
                        <Combobox.ItemGroup key={type}>
                          <Combobox.ItemGroupLabel>
                            {t.project.editors.enums.common.modelType[type]}
                          </Combobox.ItemGroupLabel>
                          {items.map((item) => (
                            <Combobox.Item key={item.id} item={item}>
                              <HStack gap="2">
                                <Icon as={getModelIcon(item.model, subProject)} />
                                <Combobox.ItemText>{item.label}</Combobox.ItemText>
                              </HStack>
                            </Combobox.Item>
                          ))}
                        </Combobox.ItemGroup>
                      )
                    )
                  })}
            </Combobox.List>
          </Combobox.Content>
        </Combobox.Positioner>
      </Portal>
    </Combobox.Root>
  )
}
