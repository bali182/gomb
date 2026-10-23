import type { PocketClusterSchema, PocketSchema } from '../../schemas/components'
import type { ComputedPocketSchema } from '../../schemas/computed'
import type { PocketOpeningLimitsSchema } from '../../schemas/limits'
import { getRecessedPocketOpeningLimits } from './getRecessedPocketOpeningLimits'
import { getSlantedPocketOpeningLimits } from './getSlantedPocketOpeningLimits'
import { getStraightPocketOpeningLimits } from './getStraightPocketOpeningLimits'

export const getPocketOpeningLimits = (
  pocket: PocketSchema,
  cluster: PocketClusterSchema,
  computed: ComputedPocketSchema,
): PocketOpeningLimitsSchema => {
  const opening = pocket.opening
  switch (opening.type) {
    case 'straight':
      return getStraightPocketOpeningLimits(opening, pocket, cluster, computed)
    case 'recessed':
      return getRecessedPocketOpeningLimits(opening, pocket, cluster, computed)
    case 'slanted':
      return getSlantedPocketOpeningLimits(opening, pocket, cluster, computed)
  }
}
