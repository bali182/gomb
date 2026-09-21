import { Box, type BoxProps } from '@chakra-ui/react'
import type { FC } from 'react'
import type { IconType } from 'react-icons'
import { PiArrowLineDown, PiArrowLineLeft, PiArrowLineRight, PiArrowLineUp, PiProhibit } from 'react-icons/pi'

import type { IssueSchema } from '../../schemas/validation'
import { NumberInput } from '../common/NumberInput'
import { Tooltip } from '../common/Tooltip'
import { HIDDEN_INPUT_OPACITY } from './colors'

export type StitchLineOffsetField =
  | 'leftStartOffset'
  | 'topStartOffset'
  | 'topEndOffset'
  | 'rightStartOffset'
  | 'rightEndOffset'
  | 'bottomStartOffset'
  | 'bottomEndOffset'
  | 'leftEndOffset'

type StitchLineOffsetInputProps = {
  disabled: boolean
  field: StitchLineOffsetField
  issue: IssueSchema | undefined
  onChange: (value: string) => void
  tooltip: string
  value: string
}

type StitchLineOffsetGridArea =
  | 'left-start-offset'
  | 'top-start-offset'
  | 'top-end-offset'
  | 'right-start-offset'
  | 'right-end-offset'
  | 'bottom-start-offset'
  | 'bottom-end-offset'
  | 'left-end-offset'

type StitchLineOffsetInputConfiguration = {
  alignSelf?: BoxProps['alignSelf']
  gridArea: StitchLineOffsetGridArea
  icon: IconType
}

// First 4 have start/end swapped because rendering logic is going cannonical, so start and end are different on bottom and left.,
const OFFSET_INPUT_CONFIGURATIONS: Record<StitchLineOffsetField, StitchLineOffsetInputConfiguration> = {
  bottomEndOffset: {
    alignSelf: 'end',
    gridArea: 'bottom-start-offset',
    icon: PiArrowLineLeft,
  },
  bottomStartOffset: {
    alignSelf: 'end',
    gridArea: 'bottom-end-offset',
    icon: PiArrowLineRight,
  },
  leftEndOffset: {
    gridArea: 'left-start-offset',
    icon: PiArrowLineUp,
  },
  leftStartOffset: {
    gridArea: 'left-end-offset',
    icon: PiArrowLineDown,
  },
  rightEndOffset: {
    gridArea: 'right-end-offset',
    icon: PiArrowLineDown,
  },
  rightStartOffset: {
    gridArea: 'right-start-offset',
    icon: PiArrowLineUp,
  },
  topEndOffset: {
    gridArea: 'top-end-offset',
    icon: PiArrowLineRight,
  },
  topStartOffset: {
    gridArea: 'top-start-offset',
    icon: PiArrowLineLeft,
  },
}

export const StitchLineOffsetInput: FC<StitchLineOffsetInputProps> = ({
  disabled,
  field,
  issue,
  onChange,
  tooltip,
  value,
}) => {
  const configuration = OFFSET_INPUT_CONFIGURATIONS[field]
  const Icon = disabled ? PiProhibit : configuration.icon

  return (
    <Tooltip content={tooltip}>
      <Box alignSelf={configuration.alignSelf} gridArea={configuration.gridArea} role="group" width="20">
        <NumberInput
          disabled={disabled}
          issue={issue}
          opacity={disabled ? HIDDEN_INPUT_OPACITY : undefined}
          size="2xs"
          startAddon={<Icon />}
          value={value}
          onChange={onChange}
        />
      </Box>
    </Tooltip>
  )
}
