import { ColorSwatch, Popover, Portal, type PopoverRootProps } from '@chakra-ui/react'
import { useCallback, type ReactElement } from 'react'
import { PiArrowCounterClockwise } from 'react-icons/pi'
import type { ColorValue } from '../../hooks/useColors'
import { useTranslation } from '../../hooks/useTranslation'
import { portalRef } from '../../portalRef'
import { EditorButton } from './EditorButton'
import { EditorIconButton } from './EditorIconButton'
import { ButtonSwatchItem, SelectableColorSwatch } from './SelectableColorSwatch'

type ColorSwatchPickerProps = {
  disabled?: boolean
  readOnly?: boolean
  value: string | undefined
  colors: ColorValue[]
  onChange: (color: string | undefined) => void
  canReset: boolean
  positioning?: PopoverRootProps['positioning']
  trigger?: ReactElement
}

export const ColorSwatchPicker = ({
  disabled,
  readOnly,
  canReset,
  value: v,
  colors,
  onChange,
  positioning,
  trigger,
}: ColorSwatchPickerProps) => {
  const { t } = useTranslation()
  const value = v?.toLowerCase()

  const handleReset = useCallback(() => {
    onChange(undefined)
  }, [onChange])

  return (
    <Popover.Root positioning={positioning}>
      <Popover.Trigger asChild>
        {trigger ?? (
          <EditorIconButton disabled={disabled} readOnly={readOnly} size="xs" variant="outline">
            <ColorSwatch size="md" value={value ?? 'transparent'} />
          </EditorIconButton>
        )}
      </Popover.Trigger>
      <Portal container={portalRef}>
        <Popover.Positioner>
          <Popover.Content p="3" width="fit-content">
            <SelectableColorSwatch
              disabled={disabled}
              readOnly={readOnly}
              colors={colors}
              onChange={onChange}
              value={value}
              canReset={canReset}
              Item={ButtonSwatchItem}
            />
            {canReset && (
              <EditorButton
                disabled={disabled}
                readOnly={readOnly}
                marginTop="3"
                onClick={handleReset}
                size="xs"
                width="full"
                variant="outline"
              >
                <PiArrowCounterClockwise />
                {t.project.editors.controls.colorSwatchPicker.reset}
              </EditorButton>
            )}
          </Popover.Content>
        </Popover.Positioner>
      </Portal>
    </Popover.Root>
  )
}
