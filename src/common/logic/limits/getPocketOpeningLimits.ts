import type { PocketClusterSchema, PocketOpeningSchema } from '../../schemas/components'
import type { ComputedPocketClusterSchema } from '../../schemas/computed'
import type { PocketOpeningLimitsSchema } from '../../schemas/limits'
import { getRecessedPocketOpeningLimits } from './getRecessedPocketOpeningLimits'
import { getStraightPocketOpeningLimits } from './getStraightPocketOpeningLimits'

export const getPocketOpeningLimits = (
  opening: PocketOpeningSchema,
  pocketCluster: PocketClusterSchema,
  computedPocketCluster: ComputedPocketClusterSchema,
): PocketOpeningLimitsSchema => {
  switch (opening.type) {
    case 'straight':
      return getStraightPocketOpeningLimits(opening, pocketCluster, computedPocketCluster)
    case 'recessed':
      return getRecessedPocketOpeningLimits(opening, pocketCluster, computedPocketCluster)
  }
}
