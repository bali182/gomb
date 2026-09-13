import { Button, ColorSwatch, HStack, Input, type PopoverRootProps } from '@chakra-ui/react'
import { useCallback, useMemo, useRef, type ReactElement } from 'react'
import type { IconType } from 'react-icons'

import { leatherColors } from '../../data/colors'
import { useColors } from '../../hooks/useColors'
import type { BaseComponentSchema } from '../../schemas/components'
import type { EditableSchema } from '../../schemas/editable'
import type { IssueSchema, ValidationIssuesSchema } from '../../schemas/validation'
import { isDefined } from '../../utils/isDefined'
import { ColorSwatchPicker } from '../common/ColorSwatchPicker'
import { IdentityFloatingEditorHeader } from '../common/IdentityFloatingEditorHeader'

type ComponentFloatingEditorHeaderProps<T extends BaseComponentSchema> = {
  baseColor: string
  editable: EditableSchema<T>
  icon: IconType
  issues: ValidationIssuesSchema<T>
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
  isResetEnabled: boolean
  issue: IssueSchema | undefined
  onChange: (value: string) => void
  onReset: () => void
  value: string
}

const HeaderColorInput = ({ isResetEnabled, issue, onChange, onReset, value }: HeaderColorInputProps) => {
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
      if (isDefined(color)) {
        onChange(color)
      } else {
        onReset()
      }
    },
    [onChange, onReset],
  )
  const popoverLeatherColors = useColors(leatherColors)
  const isInvalid = isDefined(issue) && issue.severity === 'error'

  return (
    <HStack gap="1" ref={inputRef}>
      <ColorSwatchPicker
        canReset={isResetEnabled}
        value={value}
        colors={popoverLeatherColors}
        onChange={handlePopoverChange}
        positioning={positioning}
        trigger={
          <Button
            alignItems="center"
            aria-invalid={isInvalid}
            border="0"
            display="flex"
            justifyContent="center"
            p="0"
            unstyled
          >
            <ColorSwatch value={value} />
          </Button>
        }
      />
      <Input
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
