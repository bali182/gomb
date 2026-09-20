import { Button, ColorSwatch, IconButton, Popover, Portal, type PopoverRootProps } from '@chakra-ui/react'
import type { ReactElement } from 'react'
import { PiArrowCounterClockwise } from 'react-icons/pi'
import type { ColorValue } from '../../hooks/useColors'
import { useTranslation2 } from '../../hooks/useTranslation2'
import { portalRef } from '../../portalRef'
import { ButtonSwatchItem, SelectableColorSwatch } from './SelectableColorSwatch'

type ColorSwatchPickerProps = {
  value: string | undefined
  colors: ColorValue[]
  onChange: (color: string | undefined) => void
  canReset: boolean
  positioning?: PopoverRootProps['positioning']
  trigger?: ReactElement
}

export const ColorSwatchPicker = ({
  canReset,
  value: v,
  colors,
  onChange,
  positioning,
  trigger,
}: ColorSwatchPickerProps) => {
  const { t } = useTranslation2()
  const value = v?.toLowerCase()

  return (
    <Popover.Root positioning={positioning}>
      <Popover.Trigger asChild>
        {trigger ?? (
          <IconButton size="xs" variant="outline">
            <ColorSwatch size="md" value={value ?? 'transparent'} />
          </IconButton>
        )}
      </Popover.Trigger>
      <Portal container={portalRef}>
        <Popover.Positioner>
          <Popover.Content p="3" width="fit-content">
            <SelectableColorSwatch
              colors={colors}
              onChange={onChange}
              value={value}
              canReset={canReset}
              Item={ButtonSwatchItem}
            />
            {canReset && (
              <Button marginTop="3" onClick={() => onChange(undefined)} size="xs" width="full" variant="outline">
                <PiArrowCounterClockwise />
                {t.project.editors.controls.colorSwatchPicker.reset}
              </Button>
            )}
          </Popover.Content>
        </Popover.Positioner>
      </Portal>
    </Popover.Root>
  )
}
