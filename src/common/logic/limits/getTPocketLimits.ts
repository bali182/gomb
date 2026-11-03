import BigNumber from 'bignumber.js'
import { POSITION_EPSILON } from '../../constants/layout'
import type { PocketClusterSchema, TPocketSchema } from '../../schemas/components'
import type { ComputedTPocketSchema } from '../../schemas/computed'
import type { TPocketLimitsSchema } from '../../schemas/limits'
import type { PocketOpeningSchema } from '../../schemas/pocketOpening'
import { clamp } from '../../utils/clamp'
import { getPocketOpeningLimits } from './getPocketOpeningLimits'

export const getTPocketLimits = (
  pocket: TPocketSchema,
  opening: PocketOpeningSchema,
  computed: ComputedTPocketSchema,
  cluster: PocketClusterSchema,
): TPocketLimitsSchema => {
  const rect = computed.boundingRect
  const width = cluster.orientation === 'up' || cluster.orientation === 'down' ? rect.width : rect.height
  const maximum = BigNumber.maximum(0, width.dividedBy(2).minus(POSITION_EPSILON))
  const adjusted: TPocketSchema = {
    ...pocket,
    tPocketTabWidth: clamp(pocket.tPocketTabWidth, 0, maximum).toNumber(),
    tPocketTaper: clamp(pocket.tPocketTaper, 0, maximum).toNumber(),
  }
  return {
    type: pocket.type,
    tPocketTabWidth: { max: { value: maximum, reason: 't-pocket-tab-width-exceeds-half-width', severity: 'warning' } },
    tPocketTaper: { max: { value: maximum, reason: 't-pocket-taper-exceeds-half-width', severity: 'warning' } },
    opening: getPocketOpeningLimits(adjusted, opening, cluster, computed),
  }
}
