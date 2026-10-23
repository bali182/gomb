import BigNumber from 'bignumber.js'

import type { PocketClusterSchema } from '../schemas/components'
import type { RectSchema } from '../schemas/geometry'
import { calculatePocketDepth } from './pocketUtils'

export const calculatePocketBoundingBox = (
  pocketCluster: PocketClusterSchema,
  rect: RectSchema,
  index: number,
): RectSchema => {
  const pocketDepth = calculatePocketDepth(pocketCluster, rect)

  switch (pocketCluster.orientation) {
    case 'up':
      return {
        x: rect.x,
        y: rect.y.plus(new BigNumber(index).times(pocketCluster.pocketStep)),
        width: rect.width,
        height: pocketDepth,
      }
    case 'down':
      return {
        x: rect.x,
        y: rect.y.plus(
          new BigNumber(pocketCluster.children.length).minus(1).minus(index).times(pocketCluster.pocketStep),
        ),
        width: rect.width,
        height: pocketDepth,
      }
    case 'left':
      return {
        x: rect.x.plus(new BigNumber(index).times(pocketCluster.pocketStep)),
        y: rect.y,
        width: pocketDepth,
        height: rect.height,
      }
    case 'right':
      return {
        x: rect.x.plus(
          new BigNumber(pocketCluster.children.length).minus(1).minus(index).times(pocketCluster.pocketStep),
        ),
        y: rect.y,
        width: pocketDepth,
        height: rect.height,
      }
  }
}
