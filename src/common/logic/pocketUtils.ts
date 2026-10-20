import BigNumber from 'bignumber.js'

import type { PocketClusterSchema } from '../schemas/components'
import type { RectSchema } from '../schemas/geometry'
import { clamp } from '../utils/clamp'

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
