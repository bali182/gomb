import BigNumber from 'bignumber.js'

import type { PocketClusterSchema, PocketOpeningSchema } from '../schemas/components'
import type { ComputedTopPocketSchema, ComputedTPocketSchema } from '../schemas/computed'
import type { RectSchema } from '../schemas/geometry'
import { accessors } from '../utils/accessors'
import { clamp } from '../utils/clamp'
import { isDefined } from '../utils/isDefined'

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

export const getRelevantOpeningPockets = (
  opening: PocketOpeningSchema,
  pocketCluster: PocketClusterSchema,
  frontPocket: ComputedTopPocketSchema,
  tPockets: readonly ComputedTPocketSchema[],
): readonly (ComputedTopPocketSchema | ComputedTPocketSchema)[] => {
  const openingAccessor = accessors.pocketCluster(pocketCluster)
  const pockets: (ComputedTopPocketSchema | ComputedTPocketSchema)[] = []
  const tPocket = tPockets.find((_, index) => openingAccessor.opening(index + 1).id === opening.id)
  if (isDefined(tPocket)) {
    pockets.push(tPocket)
  }
  if (openingAccessor.opening(pocketCluster.pocketCount).id === opening.id) {
    pockets.push(frontPocket)
  }
  if (pockets.length === 0) {
    pockets.push(frontPocket)
    const firstTPocket = tPockets[0]
    if (isDefined(firstTPocket)) {
      pockets.push(firstTPocket)
    }
  }
  return pockets
}
