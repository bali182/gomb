import type { PocketClusterSchema } from '../../schemas/components'
import type { ComputedComponentSchema, ComputedPocketClusterSchema } from '../../schemas/computed'
import type { PocketClusterLimitsSchema, PocketOpeningLimitsSchema } from '../../schemas/limits'
import { getCornerRadius } from '../cornerRadiusUtils'
import { getPocketClusterCornerRadiusLimits } from './getPocketClusterCornerRadiusLimits'
import { getPocketOpeningLimits } from './getPocketOpeningLimits'

export const getPocketClusterLimits = (
  pocketCluster: PocketClusterSchema,
  computed: ComputedPocketClusterSchema,
  parent: ComputedComponentSchema,
): PocketClusterLimitsSchema => {
  const openings: Record<string, PocketOpeningLimitsSchema> = {}
  for (const opening of [pocketCluster.defaultOpening, ...pocketCluster.openings]) {
    openings[opening.id] = getPocketOpeningLimits(opening, pocketCluster, computed)
  }
  return {
    type: pocketCluster.type,
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
