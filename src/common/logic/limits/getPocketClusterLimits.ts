import type { PocketClusterSchema } from '../../schemas/components'
import type { ComputedComponentSchema, ComputedPocketClusterSchema } from '../../schemas/computed'
import type { PocketClusterLimitsSchema } from '../../schemas/limits'
import { getCornerRadius } from '../cornerRadiusUtils'
import { getPocketClusterCornerRadiusLimits } from './getPocketClusterCornerRadiusLimits'
import { getPocketsLimits } from './getPocketsLimits'
import { getStretchLimits } from './getStretchLimits'

export const getPocketClusterLimits = (
  cluster: PocketClusterSchema,
  computed: ComputedPocketClusterSchema,
  parent: ComputedComponentSchema,
): PocketClusterLimitsSchema => ({
  type: cluster.type,
  ...getPocketsLimits(cluster, computed.boundingRect),
  ...getStretchLimits(cluster, computed.layoutBoundingRect),
  ...getPocketClusterCornerRadiusLimits({
    pocketCluster: cluster,
    boundingRect: computed.boundingRect,
    cornerRadius: getCornerRadius(cluster),
    parentBoundingRect: parent.boundingRect,
    parentCornerRadius: parent.cornerRadius,
  }),
})
