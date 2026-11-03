import { ColorSwatch, HStack, type PopoverRootProps } from '@chakra-ui/react'
import { useCallback, useMemo, useRef, type ReactElement, type ReactNode } from 'react'

import { useEditorContext } from '../../contexts/EditorContext'
import { leatherColors } from '../../data/colors'
import { useColors } from '../../hooks/useColors'
import type { BaseComponentSchema } from '../../schemas/components'
import type { EditableSchema } from '../../schemas/editable'
import type { IssueSchema, IssuesSchema } from '../../schemas/issues'
import { isDefined } from '../../utils/isDefined'
import { ColorSwatchPicker } from '../common/ColorSwatchPicker'
import { EditorButton } from '../common/EditorButton'
import { EditorTextInput } from '../common/EditorTextInput'
import { IdentityFloatingEditorHeader } from '../common/IdentityFloatingEditorHeader'

type ComponentFloatingEditorHeaderProps<T extends BaseComponentSchema> = {
  baseColor: string
  editable: EditableSchema<T>
  icon: ReactNode
  issues: IssuesSchema<T>
  menu: ReactElement
  onChange: (updated: EditableSchema<T>) => void
  onResetColor: () => void
}

export const ComponentFloatingEditorHeader = <T extends BaseComponentSchema>({
  baseColor,
  editable,
  icon,
  issues,
  menu,
  onChange,
  onResetColor,
}: ComponentFloatingEditorHeaderProps<T>) => {
  const effectiveColor = editable.color ?? baseColor

  const handleColorChange = useCallback(
    (color: string) => {
      onChange({ ...editable, color })
    },
    [editable, onChange],
  )

  return (
    <IdentityFloatingEditorHeader
      editable={editable}
      icon={icon}
      issues={issues}
      menu={menu}
      onChange={onChange}
      rightAddon={
        <HeaderColorInput
          modelId={editable.id}
          isResetEnabled={isDefined(editable.color)}
          issue={issues.color}
          onChange={handleColorChange}
          onReset={onResetColor}
          value={effectiveColor}
        />
      }
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
