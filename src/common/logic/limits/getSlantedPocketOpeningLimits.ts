import BigNumber from 'bignumber.js'
import { ZERO } from '../../constants/layout'
import type { PocketClusterSchema, PocketSchema, SlantedPocketOpeningSchema } from '../../schemas/components'
import type { ComputedPocketSchema } from '../../schemas/computed'
import type { SlantedPocketOpeningLimitsSchema } from '../../schemas/limits'
import { narrowers } from '../../utils/narrowers'
import { getTPocketTabDepth } from '../pocketUtils'

export const getSlantedPocketOpeningLimits = (
  opening: SlantedPocketOpeningSchema,
  pocket: PocketSchema,
  cluster: PocketClusterSchema,
  computed: ComputedPocketSchema,
): SlantedPocketOpeningLimitsSchema => {
  const vertical = cluster.orientation === 'up' || cluster.orientation === 'down'
  const depth = vertical ? computed.boundingRect.height : computed.boundingRect.width
  const width = vertical ? computed.boundingRect.width : computed.boundingRect.height
  const reserved = getReservedDepth(opening, pocket, cluster, computed)
  return {
    type: opening.type,
    offset: {
      max: {
        value: width.isZero() ? ZERO : BigNumber.maximum(depth.minus(reserved), 0),
        reason: 'slanted-pocket-opening-offset-exceeds-pocket',
        severity: 'warning',
      },
    },
  }
}

const getReservedDepth = (
  opening: SlantedPocketOpeningSchema,
  pocket: PocketSchema,
  cluster: PocketClusterSchema,
  computed: ComputedPocketSchema,
): BigNumber => {
  if (narrowers.is.tPocket(pocket)) {
    return getTPocketTabDepth(cluster, computed.boundingRect)
  }
  const radius = computed.cornerRadius
  switch (cluster.orientation) {
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
