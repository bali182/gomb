import {
  Box,
  Combobox,
  HStack,
  Icon,
  InputGroup,
  Portal,
  TagsInput,
  createListCollection,
  useCombobox,
  useFilter,
  useTagsInput,
  type ComboboxInputValueChangeDetails,
  type ComboboxOpenChangeDetails,
  type ComboboxValueChangeDetails,
  type InputGroupProps,
  type ListCollection,
  type SystemStyleObject,
  type TagsInputValueChangeDetails,
  type Tokens,
} from '@chakra-ui/react'
import { useCallback, useId, useMemo, useRef, useState, type FC, type ReactNode } from 'react'
import { PiArrowRight, PiPlus } from 'react-icons/pi'
import { useEditorContext } from '../../contexts/EditorContext'
import { useSubProject } from '../../hooks/useSubProject'
import { useTranslation } from '../../hooks/useTranslation'
import { portalRef } from '../../portalRef'
import type { ConstraintFieldNameSchema } from '../../schemas/constraints'
import type { ConstraintFieldInputSchema } from '../../schemas/factory'
import type { ModelObjectSchema } from '../../schemas/modelObject'
import { getModelIcon } from '../../utils/getModelIcon'
import { isDefined } from '../../utils/isDefined'
import { narrowers } from '../../utils/narrowers'
import { EditorButton } from '../common/EditorButton'
import { getConstraintFieldIcon } from './getConstraintFieldIcon'
import type { ConstraintFieldAdderState } from './constraintFieldUtils'

const modelChoicePadding: Tokens['spacing'] = '2'
const modelChoiceIndent: Tokens['spacing'] = '4'
const comboboxValue: string[] = []
const endAddonProps: InputGroupProps['endAddonProps'] = { px: '0', size: 'sm' }
const modelChoiceDisabledStyles: SystemStyleObject = { opacity: 1 }
const fieldInputStyles: SystemStyleObject = { minWidth: '0', _readOnly: { display: 'block' } }

const validateTag = (): boolean => false

export type ConstraintModelChoice = {
  id: string
  label: string
  model: ModelObjectSchema
  depth: number
  disabled: boolean
}

export type ConstraintPropertyChoice = {
  id: ConstraintFieldNameSchema
  label: string
  field: ConstraintFieldInputSchema
}

type ConstraintFieldChoice = ConstraintModelChoice | ConstraintPropertyChoice

type ConstraintFieldComboboxIds = {
  input: string
  control: string
}

type ConstraintFieldComboboxProps = {
  modelChoices: ConstraintModelChoice[]
  propertyChoices: ConstraintPropertyChoice[]
  selection: ConstraintFieldAdderState
  onSelectionChange: (selection: ConstraintFieldAdderState) => void
  onAdd: () => void
}

export const ConstraintFieldCombobox: FC<ConstraintFieldComboboxProps> = ({
  modelChoices,
  propertyChoices,
  selection,
  onSelectionChange,
  onAdd,
}) => {
  const { subProject } = useSubProject()
  const { isComputing } = useEditorContext()
  const { t } = useTranslation()
  const [search, setSearch] = useState<string>('')
  const [open, setOpen] = useState<boolean>(false)
  const addButtonRef = useRef<HTMLButtonElement>(null)
  const searching = search.trim().length > 0
  const { contains } = useFilter({ sensitivity: 'base' })
  const selectedModel = useMemo<ConstraintModelChoice | undefined>(
    () => modelChoices.find((item) => item.id === selection.modelId),
    [modelChoices, selection.modelId],
  )
  const selectedProperty = useMemo<ConstraintPropertyChoice | undefined>(
    () => propertyChoices.find((item) => item.id === selection.property),
    [propertyChoices, selection.property],
  )
  const complete = isDefined(selectedModel) && isDefined(selectedProperty)
  const value = useMemo<string[]>(() => {
    if (!isDefined(selectedModel)) {
      return []
    }
    return isDefined(selectedProperty) ? [selectedModel.id, selectedProperty.id] : [selectedModel.id]
  }, [selectedModel, selectedProperty])
  const filteredModels = useMemo<ConstraintModelChoice[]>(
    () => modelChoices.filter((item) => contains(item.label, search.trim())),
    [modelChoices, contains, search],
  )
  const filteredComponents = useMemo<ConstraintModelChoice[]>(
    () => filteredModels.filter((item) => !narrowers.is.pocketOpening(item.model)),
    [filteredModels],
  )
  const filteredOpenings = useMemo<ConstraintModelChoice[]>(
    () => filteredModels.filter((item) => narrowers.is.pocketOpening(item.model)),
    [filteredModels],
  )
  const filteredProperties = useMemo<ConstraintPropertyChoice[]>(
    () => propertyChoices.filter((item) => contains(item.label, search.trim())),
    [propertyChoices, contains, search],
  )
  const collection = useMemo<ListCollection<ConstraintFieldChoice>>(
    () =>
      createListCollection<ConstraintFieldChoice>({
        items: isDefined(selectedModel) ? filteredProperties : filteredModels,
        itemToString: (item) => item.label,
        itemToValue: (item) => item.id,
        isItemDisabled: (item) => 'disabled' in item && item.disabled,
      }),
    [selectedModel, filteredProperties, filteredModels],
  )
  const id = useId()
  const ids = useMemo<ConstraintFieldComboboxIds>(() => ({ input: `${id}:input`, control: `${id}:control` }), [id])

  const handleTagsChange = useCallback(
    (details: TagsInputValueChangeDetails): void => {
      if (isComputing) {
        return
      }
      if (!isDefined(selectedModel) || !details.value.includes(selectedModel.id)) {
        onSelectionChange({ modelId: undefined, property: undefined })
      } else if (!isDefined(selectedProperty) || !details.value.includes(selectedProperty.id)) {
        onSelectionChange({ modelId: selectedModel.id, property: undefined })
      } else {
        return
      }
      setSearch('')
      setOpen(true)
    },
    [isComputing, onSelectionChange, selectedModel, selectedProperty],
  )

  const handleChoiceChange = useCallback(
    (details: ComboboxValueChangeDetails<ConstraintFieldChoice>): void => {
      const item = details.items[0]
      if (isComputing || complete || !isDefined(item)) {
        return
      }
      if ('model' in item) {
        if (item.disabled) {
          return
        }
        onSelectionChange({ modelId: item.id, property: undefined })
        setOpen(true)
      } else if (isDefined(selectedModel)) {
        onSelectionChange({ modelId: selectedModel.id, property: item.id })
        setOpen(false)
      }
      setSearch('')
    },
    [complete, isComputing, onSelectionChange, selectedModel],
  )

  const handleInputValueChange = useCallback((details: ComboboxInputValueChangeDetails): void => {
    if (details.reason === 'input-change') {
      setSearch(details.inputValue)
    }
  }, [])

  const handleOpenChange = useCallback(
    (details: ComboboxOpenChangeDetails): void => {
      setOpen(details.open && !complete)
      if (!details.open) {
        setSearch('')
      }
    },
    [complete],
  )

  const handleExitComplete = useCallback((): void => {
    if (complete && !isComputing) {
      addButtonRef.current?.focus()
    }
  }, [complete, isComputing])

  const tags = useTagsInput({
    ids,
    value,
    inputValue: search,
    max: 2,
    readOnly: isComputing,
    editable: false,
    validate: validateTag,
    onValueChange: handleTagsChange,
  })
  const combobox = useCombobox<ConstraintFieldChoice>({
    ids,
    collection,
    value: comboboxValue,
    inputValue: search,
    open: open && !complete,
    inputBehavior: searching ? 'autohighlight' : 'none',
    openOnClick: true,
    openOnChange: !complete,
    closeOnSelect: false,
    selectionBehavior: 'clear',
    readOnly: isComputing,
    onValueChange: handleChoiceChange,
    onInputValueChange: handleInputValueChange,
    onOpenChange: handleOpenChange,
  })

  const handleAdd = useCallback((): void => {
    if (isComputing || !complete) {
      return
    }
    onAdd()
    combobox.focus()
  }, [combobox, complete, isComputing, onAdd])

  const renderModelItem = useCallback(
    (item: ConstraintModelChoice): ReactNode => {
      const paddingInlineStart = `calc({spacing.${modelChoicePadding}} + ${searching ? 0 : item.depth} * {spacing.${modelChoiceIndent}})`
      return (
        <Combobox.Item
          key={item.id}
          item={item}
          position="relative"
          ps={paddingInlineStart}
          _disabled={modelChoiceDisabledStyles}
        >
          {!searching &&
            Array.from({ length: item.depth }, (_, depth: number): ReactNode => {
              const insetInlineStart = `calc({spacing.${modelChoicePadding}} + ${depth} * {spacing.${modelChoiceIndent}} + {spacing.${modelChoiceIndent}} / 2)`
              return (
                <Box
                  key={depth}
                  position="absolute"
                  top="0"
                  bottom="0"
                  insetInlineStart={insetInlineStart}
                  borderInlineStartWidth="1px"
                  borderColor="border"
                  pointerEvents="none"
                />
              )
            })}
          <HStack gap="2" minW="0" flex="1" color={item.disabled ? 'fg.muted' : undefined}>
            <Icon as={getModelIcon(item.model, subProject)} flexShrink="0" />
            <Combobox.ItemText>{item.label}</Combobox.ItemText>
          </HStack>
          <Combobox.ItemIndicator />
        </Combobox.Item>
      )
    },
    [searching, subProject],
  )

  return (
    <Combobox.RootProvider value={combobox} size="sm" onExitComplete={handleExitComplete}>
      <TagsInput.RootProvider value={tags} size="sm" minW="0">
        <InputGroup
          minW="0"
          endAddon={
            <EditorButton
              ref={addButtonRef}
              alignSelf="stretch"
              borderLeftRadius="0"
              pr="2"
              pl="1.5"
              gap="1"
              height="auto"
              size="sm"
              readOnly={isComputing}
              disabled={!complete}
              onClick={handleAdd}
            >
              <PiPlus />
            </EditorButton>
          }
          endAddonProps={endAddonProps}
        >
          <Combobox.Control asChild>
            <TagsInput.Control
              bg="bg.panel"
              flex="1"
              flexWrap="nowrap"
              minW="0"
              borderRightRadius="0"
              overflow="hidden"
            >
              {isDefined(selectedModel) && (
                <>
                  <TagsInput.Item index={0} value={selectedModel.id} flexShrink="1" minW="0">
                    <TagsInput.ItemPreview>
                      <TagsInput.ItemText truncate>{selectedModel.label}</TagsInput.ItemText>
                      <TagsInput.ItemDeleteTrigger />
                    </TagsInput.ItemPreview>
                  </TagsInput.Item>
                  <Icon as={PiArrowRight} flexShrink="0" />
                </>
              )}
              {isDefined(selectedProperty) && (
                <TagsInput.Item index={1} value={selectedProperty.id} flexShrink="1" minW="0">
                  <TagsInput.ItemPreview>
                    <TagsInput.ItemText truncate>{selectedProperty.label}</TagsInput.ItemText>
                    <TagsInput.ItemDeleteTrigger />
                  </TagsInput.ItemPreview>
                </TagsInput.Item>
              )}
              <Combobox.Input unstyled asChild>
                <TagsInput.Input
                  css={fieldInputStyles}
                  readOnly={complete}
                  placeholder={
                    complete
                      ? ''
                      : isDefined(selectedModel)
                        ? t.project.editors.sections.constraints.addFields.property.placeholder
                        : t.project.editors.sections.constraints.addFields.modelId.placeholder
                  }
                />
              </Combobox.Input>
              <Combobox.Trigger disabled={complete} flexShrink="0" />
            </TagsInput.Control>
          </Combobox.Control>
        </InputGroup>
        <Portal container={portalRef}>
          <Combobox.Positioner>
            <Combobox.Content maxH="72" overflowY="auto">
              <Combobox.Empty>{t.project.editors.sections.constraints.addFields.noMatches}</Combobox.Empty>
              <Combobox.List>
                {isDefined(selectedModel) ? (
                  filteredProperties.map((item) => (
                    <Combobox.Item key={item.id} item={item}>
                      <Icon as={getConstraintFieldIcon(item.id)} size="sm" flexShrink="0" />
                      <Combobox.ItemText>{item.label}</Combobox.ItemText>
                      <Combobox.ItemIndicator />
                    </Combobox.Item>
                  ))
                ) : (
                  <>
                    {filteredComponents.length > 0 && (
                      <Combobox.ItemGroup>
                        <Combobox.ItemGroupLabel>
                          {t.project.editors.sections.constraints.addFields.components}
                        </Combobox.ItemGroupLabel>
                        {filteredComponents.map(renderModelItem)}
                      </Combobox.ItemGroup>
                    )}
                    {filteredOpenings.length > 0 && (
                      <Combobox.ItemGroup>
                        <Combobox.ItemGroupLabel>
                          {t.project.editors.sections.constraints.addFields.pocketOpenings}
                        </Combobox.ItemGroupLabel>
                        {filteredOpenings.map(renderModelItem)}
                      </Combobox.ItemGroup>
                    )}
                  </>
                )}
              </Combobox.List>
            </Combobox.Content>
          </Combobox.Positioner>
        </Portal>
      </TagsInput.RootProvider>
    </Combobox.RootProvider>
  )
}
