import { ZERO, ZERO_CORNER_RADIUS } from '../constants/layout'
import type { PocketClusterSchema, PocketSchema, TPocketSchema } from '../schemas/components'
import type { ComputedFrontPocketSchema, ComputedPocketSchema, ComputedTPocketSchema } from '../schemas/computed'
import type { CornerRadiusSchema, RectSchema } from '../schemas/geometry'
import type { SubProjectSchema } from '../schemas/subProject'
import { accessors } from '../utils/accessors'
import { clamp } from '../utils/clamp'
import { narrowers } from '../utils/narrowers'
import { calculatePocketBoundingBox } from './calculatePocketBoundingBox'
import { calculatePocketItem } from './calculatePocketItem'
import { getCornerRadius } from './cornerRadiusUtils'
import { getAdjustedCornerRadius } from './getAdjustedCornerRadius'
import { getAdjustedPocketOpening } from './getAdjustedPocketOpening'
import { getFrontPocketCornerRadiusLimits } from './limits/getFrontPocketCornerRadiusLimits'
import { getPocketOpeningLimits } from './limits/getPocketOpeningLimits'
import { getTPocketLimits } from './limits/getTPocketLimits'
import { createPocketCalculator } from './pockets/createPocketCalculator'

export type PocketClusterGeometry = { children: ComputedPocketSchema[] }

export const calculatePocketClusterGeometry = (
  cluster: PocketClusterSchema,
  pockets: readonly PocketSchema[],
  rect: RectSchema,
  radius: CornerRadiusSchema,
  subProject: SubProjectSchema,
): PocketClusterGeometry => {
  const accessor = accessors.subProject(subProject)
  return {
    children: pockets.map((pocket, index): ComputedPocketSchema => {
      const opening = accessor.pocketOpening.byId(pocket.openingId)
      const boundingRect = calculatePocketBoundingBox(cluster, rect, index)
      const cornerRadius = getPocketCornerRadius(pocket, boundingRect, rect, radius, cluster)

      if (narrowers.is.frontPocket(pocket)) {
        const computed: ComputedFrontPocketSchema = {
          type: 'computed-front-pocket',
          componentId: pocket.id,
          boundingRect,
          cornerRadius,
          item: calculatePocketItem(pocket, cluster, boundingRect),
          children: [],
          path: { commands: [] },
          computedLayoutGap: ZERO,
        }
        const limits = getPocketOpeningLimits(pocket, opening, cluster, computed)
        return {
          ...computed,
          path: createPocketCalculator(
            pocket,
            cluster,
            getAdjustedPocketOpening(opening, limits),
            boundingRect,
            cornerRadius,
          ).getFrontPocketPath(),
        }
      }
      const computed: ComputedTPocketSchema = {
        type: 'computed-t-pocket',
        componentId: pocket.id,
        boundingRect,
        cornerRadius,
        item: calculatePocketItem(pocket, cluster, boundingRect),
        children: [],
        path: { commands: [] },
      }
      const limits = getTPocketLimits(pocket, opening, computed, cluster)
      const adjusted: TPocketSchema = {
        ...pocket,
        tPocketTabWidth: clamp(pocket.tPocketTabWidth, 0, limits.tPocketTabWidth?.max?.value).toNumber(),
        tPocketTaper: clamp(pocket.tPocketTaper, 0, limits.tPocketTaper?.max?.value).toNumber(),
      }
      return {
        ...computed,
        path: createPocketCalculator(
          adjusted,
          cluster,
          getAdjustedPocketOpening(opening, limits.opening),
          boundingRect,
          cornerRadius,
        ).getTPocketPath(),
      }
    }),
  }
}
const getPocketCornerRadius = (
  pocket: PocketSchema,
  boundingRect: RectSchema,
  clusterRect: RectSchema,
  radius: CornerRadiusSchema,
  cluster: PocketClusterSchema,
): CornerRadiusSchema => {
  if (!narrowers.is.frontPocket(pocket)) {
    return ZERO_CORNER_RADIUS
  }
  const limits = getFrontPocketCornerRadiusLimits(
    {
      boundingRect,
      cornerRadius: getCornerRadius(pocket),
      parentBoundingRect: clusterRect,
      parentCornerRadius: radius,
    },
    cluster,
  )
  return getAdjustedCornerRadius(getCornerRadius(pocket), limits)
}
