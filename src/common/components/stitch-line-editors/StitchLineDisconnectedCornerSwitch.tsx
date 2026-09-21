import { Box, Switch, type SystemStyleObject, type Tokens } from '@chakra-ui/react'
import type { FC } from 'react'
import { PiLineSegment, PiProhibit, PiScissors } from 'react-icons/pi'

import type { StitchCornerSchema } from '../../schemas/stitching'
import { Tooltip } from '../common/Tooltip'
import { HIDDEN_INPUT_OPACITY } from './colors'

type StitchLineDisconnectedCornerSwitchProps = {
  checked: boolean
  corner: StitchCornerSchema
  disabled: boolean
  onCheckedChange: (checked: boolean) => void
  tooltip: string
}

const INSET: Tokens['spacing'] = '4'

const DISCONNECTED_CORNER_SWITCH_LAYOUTS: Record<StitchCornerSchema, SystemStyleObject> = {
  'bottom-left': { bottom: INSET, left: INSET },
  'bottom-right': { bottom: INSET, right: INSET },
  'top-left': { left: INSET, top: INSET },
  'top-right': { right: INSET, top: INSET },
}

export const StitchLineDisconnectedCornerSwitch: FC<StitchLineDisconnectedCornerSwitchProps> = ({
  checked,
  corner,
  disabled,
  onCheckedChange,
  tooltip,
}) => {
  const OnIcon = disabled ? PiProhibit : PiLineSegment
  const OffIcon = disabled ? PiProhibit : PiScissors

  return (
    <Tooltip content={tooltip}>
      <Box
        {...DISCONNECTED_CORNER_SWITCH_LAYOUTS[corner]}
        opacity={disabled ? HIDDEN_INPUT_OPACITY : undefined}
        p="3"
        position="absolute"
      >
        <Switch.Root
          checked={checked}
          disabled={disabled}
          onCheckedChange={(details) => onCheckedChange(details.checked)}
          size="md"
        >
          <Switch.HiddenInput />
          <Switch.Control bg="bg.emphasized" _checked={{ bg: 'bg.emphasized' }}>
            <Switch.Thumb bg="bg.panel" _checked={{ bg: 'bg.panel' }}>
              <Switch.ThumbIndicator fallback={<OffIcon />}>
                <OnIcon />
              </Switch.ThumbIndicator>
            </Switch.Thumb>
          </Switch.Control>
        </Switch.Root>
      </Box>
    </Tooltip>
  )
}
