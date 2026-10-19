import { ZERO, ZERO_CORNER_RADIUS } from '../constants/layout'
import type { PocketClusterSchema, PocketOpeningSchema, StraightPocketOpeningSchema } from '../schemas/components'
import type { ComputedTPocketSchema, ComputedTopPocketSchema } from '../schemas/computed'
import type { CornerRadiusSchema, RectSchema } from '../schemas/geometry'
import { accessors } from '../utils/accessors'
import { initial } from '../utils/initial'
import { isDefined } from '../utils/isDefined'
import { last } from '../utils/last'
import { calculateFrontPocketPath } from './calculateFrontPocketPath'
import { calculatePocketBoundingBox } from './calculatePocketBoundingBox'
import { calculatePocketCard } from './calculatePocketCard'
import { calculateTPocketPath } from './calculateTPocketPath'
import { getAdjustedPocketOpening } from './getAdjustedPocketOpening'
import { getPocketOpeningLimits } from './limits/getPocketOpeningLimits'

// DUMMY straight opening.
const STRAIGHT_OPENING: StraightPocketOpeningSchema = {
  id: 'internal:straight-opening',
  name: 'Straight',
  type: 'straight',
}

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

  if (!isDefined(topPocketRect)) {
    throw new Error('Pocket cluster must contain at least one pocket')
  }

  const topPocketRadius = calculateTopPocketRadius(pocketCluster, radius)
  const frontPocket = calculateBaseFrontPocket(pocketCluster, topPocketRect, topPocketRadius)
  const tPockets = calculateBaseTPockets(pocketCluster, initial(pocketRects), radius)
  const adjustedOpenings: Record<string, PocketOpeningSchema> = {}
  for (const opening of [pocketCluster.defaultOpening, ...pocketCluster.openings]) {
    const limits = getPocketOpeningLimits(opening, pocketCluster, frontPocket, tPockets)
    adjustedOpenings[opening.id] = getAdjustedPocketOpening(opening, limits)
  }
  const openingAccessor = accessors.pocketCluster(pocketCluster)
  return {
    frontPocket: {
      ...frontPocket,
      path: calculateFrontPocketPath(
        topPocketRect,
        topPocketRadius,
        pocketCluster.orientation,
        adjustedOpenings[openingAccessor.opening(pocketCluster.pocketCount).id],
      ),
    },
    tPockets: tPockets.map(
      (pocket: ComputedTPocketSchema, index: number): ComputedTPocketSchema => ({
        ...pocket,
        path: calculateTPocketPath(
          pocket.boundingRect,
          pocketCluster,
          pocket.cornerRadius,
          adjustedOpenings[openingAccessor.opening(index + 1).id],
        ),
      }),
    ),
  }
}

const calculateBaseFrontPocket = (
  pocketCluster: PocketClusterSchema,
  pocketRect: RectSchema,
  cornerRadius: CornerRadiusSchema,
): ComputedTopPocketSchema => ({
  type: 'computed-top-pocket',
  id: `${pocketCluster.id}-top-pocket`,
  componentId: pocketCluster.id,
  boundingRect: pocketRect,
  path: calculateFrontPocketPath(pocketRect, cornerRadius, pocketCluster.orientation, STRAIGHT_OPENING),
  cornerRadius,
  card: calculatePocketCard(pocketCluster, pocketRect),
})

const calculateBaseTPockets = (
  pocketCluster: PocketClusterSchema,
  pocketRects: readonly RectSchema[],
  cornerRadius: CornerRadiusSchema,
): ComputedTPocketSchema[] =>
  pocketRects.map((pocketRect: RectSchema, index: number): ComputedTPocketSchema => {
    const radius = index === 0 ? cornerRadius : ZERO_CORNER_RADIUS
    return {
      type: 'computed-t-pocket',
      componentId: pocketCluster.id,
      id: `${pocketCluster.id}-t-pocket-${index}`,
      boundingRect: pocketRect,
      cornerRadius: radius,
      path: calculateTPocketPath(pocketRect, pocketCluster, radius, STRAIGHT_OPENING),
      card: calculatePocketCard(pocketCluster, pocketRect),
    }
  })

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
