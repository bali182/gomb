import type { PocketClusterSchema, StraightPocketOpeningSchema } from '../../schemas/components'
import type { ComputedPocketClusterSchema } from '../../schemas/computed'
import type { StraightPocketOpeningLimitsSchema } from '../../schemas/limits'

export const getStraightPocketOpeningLimits = (
  opening: StraightPocketOpeningSchema,
  _pocketCluster: PocketClusterSchema,
  _computedPocketCluster: ComputedPocketClusterSchema,
): StraightPocketOpeningLimitsSchema => ({ type: opening.type })
