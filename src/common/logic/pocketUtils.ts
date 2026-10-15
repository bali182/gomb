import BigNumber from 'bignumber.js'

import type { PocketClusterSchema, PocketOrientationSchema } from '../schemas/components'
import type { CornerRadiusSchema, RectSchema } from '../schemas/geometry'
import { clamp } from '../utils/clamp'

export const getMaximumOpeningCornerRadius = (
  cornerRadius: CornerRadiusSchema,
  orientation: PocketOrientationSchema,
): BigNumber => {
  switch (orientation) {
    case 'up':
      return BigNumber.maximum(cornerRadius.topLeft, cornerRadius.topRight)
    case 'down':
      return BigNumber.maximum(cornerRadius.bottomLeft, cornerRadius.bottomRight)
    case 'left':
      return BigNumber.maximum(cornerRadius.topLeft, cornerRadius.bottomLeft)
    case 'right':
      return BigNumber.maximum(cornerRadius.topRight, cornerRadius.bottomRight)
  }
}

export const calculatePocketDepth = (pocketCluster: PocketClusterSchema, rect: RectSchema): BigNumber => {
  return getStackLength(pocketCluster, rect).minus(
    new BigNumber(pocketCluster.pocketCount).minus(1).times(pocketCluster.pocketStep),
  )
}

export const getTPocketTabDepth = (pocketCluster: PocketClusterSchema, rect: RectSchema): BigNumber => {
  return clamp(pocketCluster.pocketStep, new BigNumber(0), getStackLength(pocketCluster, rect))
}

const getStackLength = (pocketCluster: PocketClusterSchema, rect: RectSchema): BigNumber => {
  return pocketCluster.orientation === 'up' || pocketCluster.orientation === 'down' ? rect.height : rect.width
}
