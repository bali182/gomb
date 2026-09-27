import type { FC } from 'react'
import { PiNeedle } from 'react-icons/pi'

import type { ComputedStitchRouteSchema } from '../../schemas/computed'
import { Label } from './Label'

type StitchRouteLabelProps = {
  route: ComputedStitchRouteSchema
}

export const StitchRouteLabel: FC<StitchRouteLabelProps> = ({ route }) => {
  return (
    <Label
      boundingRect={route.boundingRect}
      icon={PiNeedle}
      label={String(route.holes.length)}
      reference={route.labelPosition}
    />
  )
}
