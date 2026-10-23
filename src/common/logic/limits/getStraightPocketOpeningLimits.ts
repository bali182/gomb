import type { PocketClusterSchema, PocketSchema, StraightPocketOpeningSchema } from '../../schemas/components'
import type { ComputedPocketSchema } from '../../schemas/computed'
import type { StraightPocketOpeningLimitsSchema } from '../../schemas/limits'
export const getStraightPocketOpeningLimits = (
  opening: StraightPocketOpeningSchema,
  _pocket: PocketSchema,
  _cluster: PocketClusterSchema,
  _computed: ComputedPocketSchema,
): StraightPocketOpeningLimitsSchema => ({ type: opening.type })
