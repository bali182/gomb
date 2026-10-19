import type { PocketClusterSchema, StraightPocketOpeningSchema } from '../../schemas/components'
import type { ComputedTopPocketSchema, ComputedTPocketSchema } from '../../schemas/computed'
import type { StraightPocketOpeningLimitsSchema } from '../../schemas/limits'

export const getStraightPocketOpeningLimits = (
  opening: StraightPocketOpeningSchema,
  _pocketCluster: PocketClusterSchema,
  _frontPocket: ComputedTopPocketSchema,
  _tPockets: readonly ComputedTPocketSchema[],
): StraightPocketOpeningLimitsSchema => ({ type: opening.type })
