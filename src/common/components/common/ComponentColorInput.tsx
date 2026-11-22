import { ColorSwatch, HStack, type PopoverRootProps } from '@chakra-ui/react'
import { useCallback, useMemo, useRef, type FC } from 'react'
import { useEditableModelsContext } from '../../contexts/EditableModelsContext'
import { useEditorContext } from '../../contexts/EditorContext'
import { leatherColors } from '../../data/colors'
import { useColors } from '../../hooks/useColors'
import { useProject } from '../../hooks/useProject'
import type { BaseComponentSchema, ComponentSchema } from '../../schemas/components'
import type { IssueSchema } from '../../schemas/issues'
import { isDefined } from '../../utils/isDefined'
import { ColorSwatchPicker } from './ColorSwatchPicker'
import { EditorButton } from './EditorButton'
import { EditorTextInput } from './EditorTextInput'

type ComponentColorInputProps = {
  modelId: string
}

export const ComponentColorInput: FC<ComponentColorInputProps> = ({ modelId }) => {
  const { editableModels, validationIssues, setModel } = useEditableModelsContext<
    ComponentSchema & BaseComponentSchema
  >()
  const { project } = useProject()
  const editable = editableModels[modelId]
  const onChange = setModel[modelId]
  const handleColorChange = useCallback(
    (color: string): void => {
      onChange({ ...editable, color })
    },
    [editable, onChange],
  )
  const handleColorReset = useCallback((): void => {
    const updated = { ...editable }
    delete updated.color
    onChange(updated)
  }, [editable, onChange])

  return (
    <HeaderColorInput
      modelId={modelId}
      isResetEnabled={isDefined(editable.color)}
      issue={validationIssues[modelId].color}
      onChange={handleColorChange}
      onReset={handleColorReset}
      value={editable.color ?? project.colorSettings.leatherColor}
    />
  )
}

type HeaderColorInputProps = {
  modelId: string
  isResetEnabled: boolean
  issue: IssueSchema | undefined
  onChange: (value: string) => void
  onReset: () => void
  value: string
}

const HeaderColorInput = ({ modelId, isResetEnabled, issue, onChange, onReset, value }: HeaderColorInputProps) => {
  const { isComputing, editingInputId, setEditingInputId } = useEditorContext()
  const inputId = `${modelId}:color`
  const readOnly = isComputing && editingInputId !== inputId
  const inputRef = useRef<HTMLDivElement>(null)
  const positioning = useMemo<PopoverRootProps['positioning']>(
    () => ({
      getAnchorElement: () => inputRef.current,
      placement: 'bottom-end',
    }),
    [],
  )
  const handlePopoverChange = useCallback(
    (color: string | undefined): void => {
      setEditingInputId(inputId)
      if (isDefined(color)) {
        onChange(color)
      } else {
        onReset()
      }
    },
    [onChange, onReset, setEditingInputId, inputId],
  )
  const popoverLeatherColors = useColors(leatherColors)
  const isInvalid = isDefined(issue) && issue.severity === 'error'

  return (
    <HStack gap="1" ref={inputRef}>
      <ColorSwatchPicker
        readOnly={readOnly}
        canReset={isResetEnabled}
        value={value}
        colors={popoverLeatherColors}
        onChange={handlePopoverChange}
        positioning={positioning}
        trigger={
          <EditorButton
            readOnly={readOnly}
            alignItems="center"
            aria-invalid={isInvalid}
            border="0"
            display="flex"
            justifyContent="center"
            p="0"
            unstyled
          >
            <ColorSwatch value={value} />
          </EditorButton>
        }
      />
      <EditorTextInput
        modelId={modelId}
        field="color"
        aria-invalid={isInvalid}
        _invalid={{ borderColor: 'border.error', focusRingColor: 'border.error' }}
        borderColor="transparent"
        fieldSizing="content"
        focusRing="inside"
        focusRingColor="colorPalette.focusRing"
        onChange={(event) => onChange(event.currentTarget.value)}
        size="xs"
        value={value}
        w="auto"
      />
    </HStack>
  )
}
