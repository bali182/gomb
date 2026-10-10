import { ZERO, ZERO_CORNER_RADIUS } from '../constants/layout'
import type { PocketClusterSchema } from '../schemas/components'
import type { ComputedTPocketSchema, ComputedTopPocketSchema } from '../schemas/computed'
import type { CornerRadiusSchema, RectSchema } from '../schemas/geometry'
import { initial } from '../utils/initial'
import { last } from '../utils/last'
import { calculatePocketBoundingBox } from './calculatePocketBoundingBox'
import { calculatePocketCard } from './calculatePocketCard'
import { calculateRectPath } from './calculateRectPath'
import { calculateTPocketPath } from './calculateTPocketPath'

export type PocketClusterGeometry = {
  frontPocket: ComputedTopPocketSchema
  tPockets: ComputedTPocketSchema[]
}

export const calculatePocketClusterGeometry = (
  pocketCluster: PocketClusterSchema,
  rect: RectSchema,
  radius: CornerRadiusSchema,
): PocketClusterGeometry => {
  const pocketRects = calculatePocketBoundingBoxes(pocketCluster, rect)
  const topPocketRect = last(pocketRects)

  if (!topPocketRect) {
    throw new Error('Pocket cluster must contain at least one pocket')
  }

  const topPocketRadius = calculateTopPocketRadius(pocketCluster, radius)
  const frontPocketPath = calculateRectPath(topPocketRect, topPocketRadius)

  return {
    frontPocket: {
      type: 'computed-top-pocket',
      id: `${pocketCluster.id}-top-pocket`,
      componentId: pocketCluster.id,
      boundingRect: topPocketRect,
      path: frontPocketPath,
      uncutPath: frontPocketPath,
      cornerRadius: topPocketRadius,
      card: calculatePocketCard(pocketCluster, topPocketRect),
    },
    tPockets: initial(pocketRects).map((pocketRect, index): ComputedTPocketSchema => {
      const cornerRadius = index === 0 ? radius : ZERO_CORNER_RADIUS
      const path = calculateTPocketPath(pocketRect, pocketCluster, cornerRadius)

      return {
        type: 'computed-t-pocket',
        componentId: pocketCluster.id,
        id: `${pocketCluster.id}-t-pocket-${index}`,
        boundingRect: pocketRect,
        cornerRadius,
        path,
        uncutPath: path,
        card: calculatePocketCard(pocketCluster, pocketRect),
      }
    }),
  }
}

const calculatePocketBoundingBoxes = (pocketCluster: PocketClusterSchema, rect: RectSchema): RectSchema[] => {
  return Array.from({ length: pocketCluster.pocketCount }, (_, index) =>
    calculatePocketBoundingBox(pocketCluster, rect, index),
  )
}

const calculateTopPocketRadius = (
  pocketCluster: PocketClusterSchema,
  radius: CornerRadiusSchema,
): CornerRadiusSchema => {
  switch (pocketCluster.orientation) {
    case 'up':
      return {
        topLeft: ZERO,
        topRight: ZERO,
        bottomRight: radius.bottomRight,
        bottomLeft: radius.bottomLeft,
      }
    case 'down':
      return {
        topLeft: radius.topLeft,
        topRight: radius.topRight,
        bottomRight: ZERO,
        bottomLeft: ZERO,
      }
    case 'left':
      return {
        topLeft: ZERO,
        topRight: radius.topRight,
        bottomRight: radius.bottomRight,
        bottomLeft: ZERO,
      }
    case 'right':
      return {
        topLeft: radius.topLeft,
        topRight: ZERO,
        bottomRight: ZERO,
        bottomLeft: radius.bottomLeft,
      }
  }
}
