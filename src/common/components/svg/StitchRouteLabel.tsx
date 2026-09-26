import type { FC } from 'react'
import { PiNeedle } from 'react-icons/pi'

import type { ComputedStitchRouteSchema } from '../../schemas/computed'
import { Label } from './Label'

type StitchRouteLabelProps = {
  route: ComputedStitchRouteSchema
}

const STITCH_ROUTE_LABEL_MARGIN = 3
const STITCH_ROUTE_LABEL_PADDING_X = 1.5
const STITCH_ROUTE_LABEL_PADDING_Y = 0.3
const STITCH_ROUTE_LABEL_GAP = 0.3

export const StitchRouteLabel: FC<StitchRouteLabelProps> = ({ route }) => {
  return (
    <Label
      margin={STITCH_ROUTE_LABEL_MARGIN}
      paddingX={STITCH_ROUTE_LABEL_PADDING_X}
      paddingY={STITCH_ROUTE_LABEL_PADDING_Y}
      gap={STITCH_ROUTE_LABEL_GAP}
      boundingRect={route.boundingRect}
      icon={PiNeedle}
      label={String(route.holes.length)}
      reference={route.labelPosition}
    />
  )
}
