import {
  Combobox,
  Icon,
  InputGroup,
  TagsInput,
  useTagsInput,
  type InputGroupProps,
  type SystemStyleObject,
  type TagsInputValueChangeDetails,
} from '@chakra-ui/react'
import { useCallback, useId, useMemo, useRef, useState, type FC } from 'react'
import { PiArrowRight, PiPlus } from 'react-icons/pi'
import { useEditorContext } from '../../contexts/EditorContext'
import { useSubProject } from '../../hooks/useSubProject'
import { useTranslation } from '../../hooks/useTranslation'
import type { BindingFieldNameSchema } from '../../schemas/bindings'
import type { BindingFieldInputSchema } from '../../schemas/factory'
import type { ModelObjectSchema } from '../../schemas/modelObject'
import { getModelIcon } from '../../utils/getModelIcon'
import { isDefined } from '../../utils/isDefined'
import { narrowers } from '../../utils/narrowers'
import { EditorButton } from '../common/EditorButton'
import { TreeCombobox, type TreeComboboxGroup, type TreeComboboxItem } from '../common/TreeCombobox'
import type { BindingFieldAdderState } from './bindingFieldUtils'
import { getBindingFieldIcon } from './getBindingFieldIcon'

const comboboxValue: string[] = []
const endAddonProps: InputGroupProps['endAddonProps'] = { px: '0', size: 'xs' }
const fieldInputStyles: SystemStyleObject = { minWidth: '0', _readOnly: { display: 'block' } }

const validateTag = (): boolean => false

export type BindingModelChoice = {
  id: string
  label: string
  model: ModelObjectSchema
  depth: number
  disabled: boolean
}

export type BindingPropertyChoice = {
  id: BindingFieldNameSchema
  label: string
  field: BindingFieldInputSchema
}

type BindingFieldComboboxIds = {
  input: string
  control: string
}

type BindingFieldComboboxProps = {
  modelChoices: BindingModelChoice[]
  propertyChoices: BindingPropertyChoice[]
  selection: BindingFieldAdderState
  onSelectionChange: (selection: BindingFieldAdderState) => void
  onAdd: () => void
}

export const BindingFieldCombobox: FC<BindingFieldComboboxProps> = ({
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
  const inputRef = useRef<HTMLInputElement>(null)
  const addButtonRef = useRef<HTMLButtonElement>(null)

  const selectedModel = useMemo<BindingModelChoice | undefined>(
    () => modelChoices.find((item) => item.id === selection.modelId),
    [modelChoices, selection.modelId],
  )

  const selectedProperty = useMemo<BindingPropertyChoice | undefined>(
    () => propertyChoices.find((item) => item.id === selection.property),
    [propertyChoices, selection.property],
  )

  const complete = isDefined(selectedModel) && isDefined(selectedProperty)

  const placeholder = isDefined(selectedModel)
    ? t.project.editors.sections.bindings.addFields.property.placeholder
    : t.project.editors.sections.bindings.addFields.modelId.placeholder

  const value = useMemo<string[]>(() => {
    if (!isDefined(selectedModel)) {
      return []
    }
    return isDefined(selectedProperty) ? [selectedModel.id, selectedProperty.id] : [selectedModel.id]
  }, [selectedModel, selectedProperty])

  const items = useMemo<TreeComboboxItem[]>(() => {
    if (isDefined(selectedModel)) {
      return propertyChoices.map((item) => ({
        id: item.id,
        label: item.label,
        icon: getBindingFieldIcon(item.id),
        depth: 0,
        disabled: false,
      }))
    }
    return modelChoices.map((item) => ({
      id: item.id,
      label: item.label,
      icon: getModelIcon(item.model, subProject),
      depth: item.depth,
      disabled: item.disabled,
      groupId: narrowers.is.pocketOpening(item.model) ? 'openings' : 'components',
    }))
  }, [selectedModel, propertyChoices, modelChoices, subProject])

  const groups = useMemo<TreeComboboxGroup[]>(
    () => [
      { id: 'components', label: t.project.editors.sections.bindings.addFields.components },
      { id: 'openings', label: t.project.editors.sections.bindings.addFields.pocketOpenings },
    ],
    [t],
  )
  const id = useId()
  const ids = useMemo<BindingFieldComboboxIds>(() => ({ input: `${id}:input`, control: `${id}:control` }), [id])

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
    (id: string): void => {
      if (isComputing || complete) {
        return
      }
      if (!isDefined(selectedModel)) {
        onSelectionChange({ modelId: id, property: undefined })
        setOpen(true)
      } else {
        const property = propertyChoices.find((item) => item.id === id)
        if (!isDefined(property)) {
          return
        }
        onSelectionChange({ modelId: selectedModel.id, property: property.id })
        setOpen(false)
      }
      setSearch('')
    },
    [isComputing, complete, selectedModel, onSelectionChange, propertyChoices],
  )

  const handleOpenChange = useCallback(
    (nextOpen: boolean): void => {
      setOpen(nextOpen && !complete)
      if (!nextOpen) {
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
  const handleAdd = useCallback((): void => {
    if (isComputing || !complete) {
      return
    }
    onAdd()
    inputRef.current?.focus()
  }, [complete, isComputing, onAdd])

  return (
    <TreeCombobox
      items={items}
      groups={isDefined(selectedModel) ? undefined : groups}
      value={comboboxValue}
      inputValue={search}
      open={open && !complete}
      readOnly={isComputing}
      ids={ids}
      emptyMessage={t.project.editors.sections.bindings.addFields.noMatches}
      onSelect={handleChoiceChange}
      onInputValueChange={setSearch}
      onOpenChange={handleOpenChange}
      onExitComplete={handleExitComplete}
      control={
        <TagsInput.RootProvider value={tags} size="xs" minW="0">
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
                size="xs"
                readOnly={isComputing}
                disabled={!complete}
                onClick={handleAdd}
              >
                <Icon as={PiPlus} size="sm" />
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
                    ref={inputRef}
                    css={fieldInputStyles}
                    readOnly={complete}
                    placeholder={complete ? '' : placeholder}
                  />
                </Combobox.Input>
                <Combobox.Trigger disabled={complete} flexShrink="0" />
              </TagsInput.Control>
            </Combobox.Control>
          </InputGroup>
        </TagsInput.RootProvider>
      }
    />
  )
}
