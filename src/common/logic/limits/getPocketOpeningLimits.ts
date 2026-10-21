import type { PocketClusterSchema, PocketOpeningSchema } from '../../schemas/components'
import type { ComputedTopPocketSchema, ComputedTPocketSchema } from '../../schemas/computed'
import type { PocketOpeningLimitsSchema } from '../../schemas/limits'
import { getRecessedPocketOpeningLimits } from './getRecessedPocketOpeningLimits'
import { getSlantedPocketOpeningLimits } from './getSlantedPocketOpeningLimits'
import { getStraightPocketOpeningLimits } from './getStraightPocketOpeningLimits'

export const getPocketOpeningLimits = (
  opening: PocketOpeningSchema,
  pocketCluster: PocketClusterSchema,
  frontPocket: ComputedTopPocketSchema,
  tPockets: readonly ComputedTPocketSchema[],
): PocketOpeningLimitsSchema => {
  switch (opening.type) {
    case 'straight':
      return getStraightPocketOpeningLimits(opening, pocketCluster, frontPocket, tPockets)
    case 'recessed':
      return getRecessedPocketOpeningLimits(opening, pocketCluster, frontPocket, tPockets)
    case 'slanted':
      return getSlantedPocketOpeningLimits(opening, pocketCluster, frontPocket, tPockets)
  }
}
