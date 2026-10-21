import { ZERO_CORNER_RADIUS } from '../constants/layout'
import type { PocketClusterSchema, PocketOpeningSchema, StraightPocketOpeningSchema } from '../schemas/components'
import type { ComputedTPocketSchema, ComputedTopPocketSchema } from '../schemas/computed'
import type { CornerRadiusSchema, RectSchema } from '../schemas/geometry'
import { accessors } from '../utils/accessors'
import { initial } from '../utils/initial'
import { isDefined } from '../utils/isDefined'
import { last } from '../utils/last'
import { calculatePocketBoundingBox } from './calculatePocketBoundingBox'
import { calculatePocketCard } from './calculatePocketCard'
import { getAdjustedPocketOpening } from './getAdjustedPocketOpening'
import { getPocketOpeningLimits } from './limits/getPocketOpeningLimits'
import { createPocketCalculator } from './pockets/createPocketCalculator'

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

  const frontPocket = calculateBaseFrontPocket(pocketCluster, topPocketRect, radius)
  const tPockets = calculateBaseTPockets(pocketCluster, initial(pocketRects))
  const adjustedOpenings: Record<string, PocketOpeningSchema> = {}
  for (const opening of [pocketCluster.defaultOpening, ...pocketCluster.openings]) {
    const limits = getPocketOpeningLimits(opening, pocketCluster, frontPocket, tPockets)
    adjustedOpenings[opening.id] = getAdjustedPocketOpening(opening, limits)
  }
  const openingAccessor = accessors.pocketCluster(pocketCluster)
  return {
    frontPocket: {
      ...frontPocket,
      path: createPocketCalculator(
        pocketCluster,
        adjustedOpenings[openingAccessor.opening(pocketCluster.pocketCount).id],
        topPocketRect,
        radius,
      ).getFrontPocketPath(),
    },
    tPockets: tPockets.map(
      (pocket: ComputedTPocketSchema, index: number): ComputedTPocketSchema => ({
        ...pocket,
        path: createPocketCalculator(
          pocketCluster,
          adjustedOpenings[openingAccessor.opening(index + 1).id],
          pocket.boundingRect,
          pocket.cornerRadius,
        ).getTPocketPath(),
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
  path: createPocketCalculator(pocketCluster, STRAIGHT_OPENING, pocketRect, cornerRadius).getFrontPocketPath(),
  cornerRadius,
  card: calculatePocketCard(pocketCluster, pocketRect),
})

const calculateBaseTPockets = (
  pocketCluster: PocketClusterSchema,
  pocketRects: readonly RectSchema[],
): ComputedTPocketSchema[] =>
  pocketRects.map(
    (pocketRect: RectSchema, index: number): ComputedTPocketSchema => ({
      type: 'computed-t-pocket',
      componentId: pocketCluster.id,
      id: `${pocketCluster.id}-t-pocket-${index}`,
      boundingRect: pocketRect,
      cornerRadius: ZERO_CORNER_RADIUS,
      path: createPocketCalculator(pocketCluster, STRAIGHT_OPENING, pocketRect, ZERO_CORNER_RADIUS).getTPocketPath(),
      card: calculatePocketCard(pocketCluster, pocketRect),
    }),
  )

const calculatePocketBoundingBoxes = (pocketCluster: PocketClusterSchema, rect: RectSchema): RectSchema[] => {
  return Array.from({ length: pocketCluster.pocketCount }, (_, index) =>
    calculatePocketBoundingBox(pocketCluster, rect, index),
  )
}
