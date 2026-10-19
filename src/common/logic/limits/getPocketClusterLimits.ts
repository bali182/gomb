import type { PocketClusterSchema } from '../../schemas/components'
import type { ComputedComponentSchema, ComputedPocketClusterSchema } from '../../schemas/computed'
import type { PocketClusterLimitsSchema, PocketOpeningLimitsSchema } from '../../schemas/limits'
import { getCornerRadius } from '../cornerRadiusUtils'
import { normalizePocketCluster } from '../normalizePocketCluster'
import { getPocketClusterCornerRadiusLimits } from './getPocketClusterCornerRadiusLimits'
import { getPocketOpeningLimits } from './getPocketOpeningLimits'
import { getStretchLimits } from './getStretchLimits'

export const getPocketClusterLimits = (
  pocketCluster: PocketClusterSchema,
  computed: ComputedPocketClusterSchema,
  parent: ComputedComponentSchema,
): PocketClusterLimitsSchema => {
  const openings: Record<string, PocketOpeningLimitsSchema> = {}
  const normalizedPocketCluster = normalizePocketCluster(pocketCluster, computed.boundingRect)
  for (const opening of [pocketCluster.defaultOpening, ...pocketCluster.openings]) {
    openings[opening.id] = getPocketOpeningLimits(
      opening,
      normalizedPocketCluster,
      computed.frontPocket,
      computed.tPockets,
    )
  }
  return {
    type: pocketCluster.type,
    ...getStretchLimits(pocketCluster, computed.layoutBoundingRect),
    ...getPocketClusterCornerRadiusLimits({
      pocketCluster,
      boundingRect: computed.boundingRect,
      cornerRadius: getCornerRadius(pocketCluster),
      parentBoundingRect: parent.boundingRect,
      parentCornerRadius: parent.cornerRadius,
    }),
    openings,
  }
}
