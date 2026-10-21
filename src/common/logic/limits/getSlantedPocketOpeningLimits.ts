import BigNumber from 'bignumber.js'

import type { PocketClusterSchema, SlantedPocketOpeningSchema } from '../../schemas/components'
import type { ComputedTopPocketSchema, ComputedTPocketSchema } from '../../schemas/computed'
import type { SlantedPocketOpeningLimitsSchema } from '../../schemas/limits'
import { getRelevantOpeningPockets, getTPocketTabDepth } from '../pocketUtils'

export const getSlantedPocketOpeningLimits = (
  opening: SlantedPocketOpeningSchema,
  pocketCluster: PocketClusterSchema,
  frontPocket: ComputedTopPocketSchema,
  tPockets: readonly ComputedTPocketSchema[],
): SlantedPocketOpeningLimitsSchema => {
  const pockets = getRelevantOpeningPockets(opening, pocketCluster, frontPocket, tPockets)
  const isVertical = pocketCluster.orientation === 'up' || pocketCluster.orientation === 'down'
  const width = isVertical ? frontPocket.boundingRect.width : frontPocket.boundingRect.height
  const maximum = width.isZero()
    ? new BigNumber(0)
    : BigNumber.maximum(
        BigNumber.minimum(
          ...pockets.map((pocket): BigNumber => {
            const depth = isVertical ? pocket.boundingRect.height : pocket.boundingRect.width
            if (pocket.type === 'computed-t-pocket') {
              return depth.minus(getTPocketTabDepth(pocketCluster, pocket.boundingRect))
            }
            return depth.minus(getClosedCornerRadius(opening, pocketCluster, pocket))
          }),
        ),
        0,
      )
  return {
    type: 'slanted',
    offset: {
      max: { value: maximum, reason: 'slanted-pocket-opening-offset-exceeds-pocket', severity: 'warning' },
    },
  }
}

const getClosedCornerRadius = (
  opening: SlantedPocketOpeningSchema,
  pocketCluster: PocketClusterSchema,
  pocket: ComputedTopPocketSchema,
): BigNumber => {
  const radius = pocket.cornerRadius
  switch (pocketCluster.orientation) {
    case 'up':
      return opening.side === 'start' ? radius.bottomLeft : radius.bottomRight
    case 'right':
      return opening.side === 'start' ? radius.topLeft : radius.bottomLeft
    case 'down':
      return opening.side === 'start' ? radius.topRight : radius.topLeft
    case 'left':
      return opening.side === 'start' ? radius.bottomRight : radius.topRight
  }
}
