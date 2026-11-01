import type { PocketClusterSchema, PocketSchema } from '../../schemas/components'
import type { ComputedPocketSchema } from '../../schemas/computed'
import type { StraightPocketOpeningLimitsSchema } from '../../schemas/limits'
import type { StraightPocketOpeningSchema } from '../../schemas/pocketOpening'
export const getStraightPocketOpeningLimits = (
  opening: StraightPocketOpeningSchema,
  _pocket: PocketSchema,
  _cluster: PocketClusterSchema,
  _computed: ComputedPocketSchema,
): StraightPocketOpeningLimitsSchema => ({ type: opening.type })
