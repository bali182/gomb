import type { PocketClusterSchema } from '../../schemas/components'
import type { ComputedComponentSchema, ComputedPocketClusterSchema } from '../../schemas/computed'
import type { PocketClusterLimitsSchema } from '../../schemas/limits'
import { getPocketsLimits } from './getPocketsLimits'
import { getStretchLimits } from './getStretchLimits'

export const getPocketClusterLimits = (
  cluster: PocketClusterSchema,
  computed: ComputedPocketClusterSchema,
  _parent: ComputedComponentSchema,
): PocketClusterLimitsSchema => ({
  type: cluster.type,
  ...getPocketsLimits(cluster, computed.boundingRect),
  ...getStretchLimits(cluster, computed.layoutBoundingRect),
})
