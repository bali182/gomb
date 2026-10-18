import type { PocketClusterSchema, RecessedPocketOpeningSchema } from '../../schemas/components'
import type { ComputedPocketClusterSchema } from '../../schemas/computed'
import type { RecessedPocketOpeningLimitsSchema } from '../../schemas/limits'

/** Entry point for future recess bounds without reintroducing radius adjustment. */
export const getRecessedPocketOpeningLimits = (
  opening: RecessedPocketOpeningSchema,
  _pocketCluster: PocketClusterSchema,
  _computedPocketCluster: ComputedPocketClusterSchema,
): RecessedPocketOpeningLimitsSchema => ({ type: opening.type })
