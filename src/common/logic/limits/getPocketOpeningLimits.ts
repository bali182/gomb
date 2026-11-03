import type { PocketClusterSchema, PocketSchema } from '../../schemas/components'
import type { ComputedPocketSchema } from '../../schemas/computed'
import type { PocketOpeningLimitsSchema } from '../../schemas/limits'
import type { PocketOpeningSchema } from '../../schemas/pocketOpening'
import { getOpticalIllusionPocketOpeningLimits } from './getOpticalIllusionPocketOpeningLimits'
import { getRecessedPocketOpeningLimits } from './getRecessedPocketOpeningLimits'
import { getSlantedPocketOpeningLimits } from './getSlantedPocketOpeningLimits'
import { getStraightPocketOpeningLimits } from './getStraightPocketOpeningLimits'

export const getPocketOpeningLimits = (
  pocket: PocketSchema,
  opening: PocketOpeningSchema,
  cluster: PocketClusterSchema,
  computed: ComputedPocketSchema,
): PocketOpeningLimitsSchema => {
  switch (opening.type) {
    case 'optical-illusion':
      return getOpticalIllusionPocketOpeningLimits(opening, pocket, cluster, computed)
    case 'straight':
      return getStraightPocketOpeningLimits(opening, pocket, cluster, computed)
    case 'recessed':
      return getRecessedPocketOpeningLimits(opening, pocket, cluster, computed)
    case 'slanted':
      return getSlantedPocketOpeningLimits(opening, pocket, cluster, computed)
  }
}
