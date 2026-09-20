import { Box, Switch } from '@chakra-ui/react'
import { useCallback, type FC } from 'react'
import type { IconType } from 'react-icons'
import { PiArrowDown, PiArrowLeft, PiArrowRight, PiArrowUp, PiProhibit } from 'react-icons/pi'

import type { StitchSideSchema } from '../../schemas/stitching'
import { HIDDEN_INPUT_OPACITY } from './colors'

type StitchLineDirectionSwitchProps = {
  checked: boolean
  disabled: boolean
  onCheckedChange: (checked: boolean) => void
  side: StitchSideSchema
}

type StitchLineDirectionGridArea = 'top-direction' | 'right-direction' | 'bottom-direction' | 'left-direction'

type StitchLineDirectionSwitchConfiguration = {
  checkedIcon: IconType
  gridArea: StitchLineDirectionGridArea
  uncheckedIcon: IconType
}

const DIRECTION_SWITCH_CONFIGURATIONS: Record<StitchSideSchema, StitchLineDirectionSwitchConfiguration> = {
  bottom: {
    checkedIcon: PiArrowLeft,
    gridArea: 'bottom-direction',
    uncheckedIcon: PiArrowRight,
  },
  left: {
    checkedIcon: PiArrowUp,
    gridArea: 'left-direction',
    uncheckedIcon: PiArrowDown,
  },
  right: {
    checkedIcon: PiArrowDown,
    gridArea: 'right-direction',
    uncheckedIcon: PiArrowUp,
  },
  top: {
    checkedIcon: PiArrowRight,
    gridArea: 'top-direction',
    uncheckedIcon: PiArrowLeft,
  },
}

export const StitchLineDirectionSwitch: FC<StitchLineDirectionSwitchProps> = ({
  checked,
  disabled,
  onCheckedChange,
  side,
}) => {
  const configuration = DIRECTION_SWITCH_CONFIGURATIONS[side]
  const CheckedIcon = disabled ? PiProhibit : configuration.checkedIcon
  const UncheckedIcon = disabled ? PiProhibit : configuration.uncheckedIcon

  const handleCheckedChange = useCallback(
    (details: Switch.CheckedChangeDetails): void => {
      onCheckedChange(details.checked)
    },
    [onCheckedChange],
  )

  return (
    <Box
      alignSelf="center"
      gridArea={configuration.gridArea}
      justifySelf="center"
      opacity={disabled ? HIDDEN_INPUT_OPACITY : undefined}
    >
      <Switch.Root checked={checked} disabled={disabled} onCheckedChange={handleCheckedChange} size="md">
        <Switch.HiddenInput />
        <Switch.Control bg="bg.emphasized" _checked={{ bg: 'bg.emphasized' }}>
          <Switch.Thumb bg="bg.panel" _checked={{ bg: 'bg.panel' }}>
            <Switch.ThumbIndicator fallback={<UncheckedIcon />}>
              <CheckedIcon />
            </Switch.ThumbIndicator>
          </Switch.Thumb>
        </Switch.Control>
      </Switch.Root>
    </Box>
  )
}
