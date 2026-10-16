import { Icon } from '@chakra-ui/react'
import type { FC } from 'react'
import type { IconType } from 'react-icons'
import { PiInfo, PiWarningCircle } from 'react-icons/pi'

import type { SeveritySchema } from '../../schemas/validation'
import { Tooltip } from './Tooltip'

type TooltipIconProps = {
  content: string
  severity: SeveritySchema
}

type TooltipIconAppearance = {
  icon: IconType
  color: string
}

const tooltipIconAppearances: Record<SeveritySchema, TooltipIconAppearance> = {
  info: { icon: PiInfo, color: 'fg.muted' },
  warning: { icon: PiWarningCircle, color: 'fg.warning' },
  error: { icon: PiWarningCircle, color: 'fg.error' },
}

export const TooltipIcon: FC<TooltipIconProps> = ({ content, severity }) => {
  const appearance = tooltipIconAppearances[severity]

  return (
    <Tooltip content={content}>
      <Icon
        as={appearance.icon}
        color={appearance.color}
        cursor="pointer"
        flexShrink="0"
        pointerEvents="auto"
        size="sm"
      />
    </Tooltip>
  )
}
