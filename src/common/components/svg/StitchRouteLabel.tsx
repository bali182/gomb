import type BigNumber from 'bignumber.js'
import type { FC } from 'react'
import { PiNeedle } from 'react-icons/pi'

import { reflectRectHorizontally } from '../../logic/geometryUtils'
import type { ComputedStitchRouteSchema } from '../../schemas/computed'
import { isDefined } from '../../utils/isDefined'
import { Label } from './Label'

type StitchRouteLabelProps = {
  route: ComputedStitchRouteSchema
  reflectionAxisX?: BigNumber
}

export const StitchRouteLabel: FC<StitchRouteLabelProps> = ({ route, reflectionAxisX }) => {
  const horizontalLabelPosition = route.labelPosition === 'left' ? 'right' : 'left'
  const labelPosition =
    isDefined(reflectionAxisX) && (route.labelPosition === 'left' || route.labelPosition === 'right')
      ? horizontalLabelPosition
      : route.labelPosition
  return (
    <Label
      boundingRect={
        isDefined(reflectionAxisX) ? reflectRectHorizontally(route.boundingRect, reflectionAxisX) : route.boundingRect
      }
      icon={PiNeedle}
      label={String(route.holes.length)}
      reference={labelPosition}
    />
  )
}
