import type { PocketClusterSchema, TPocketSchema } from '../../schemas/components'
import type { ComputedTPocketSchema } from '../../schemas/computed'
import type { TPocketLimitsSchema } from '../../schemas/limits'
import { clamp } from '../../utils/clamp'
import { getPocketOpeningLimits } from './getPocketOpeningLimits'

export const getTPocketLimits = (
  pocket: TPocketSchema,
  computed: ComputedTPocketSchema,
  cluster: PocketClusterSchema,
): TPocketLimitsSchema => {
  const rect = computed.boundingRect
  const width = cluster.orientation === 'up' || cluster.orientation === 'down' ? rect.width : rect.height
  const maximum = width.dividedBy(2)
  const adjusted: TPocketSchema = {
    ...pocket,
    tPocketTabWidth: clamp(pocket.tPocketTabWidth, 0, maximum).toNumber(),
    tPocketTaper: clamp(pocket.tPocketTaper, 0, maximum).toNumber(),
  }
  return {
    type: pocket.type,
    tPocketTabWidth: { max: { value: maximum, reason: 't-pocket-tab-width-exceeds-half-width', severity: 'warning' } },
    tPocketTaper: { max: { value: maximum, reason: 't-pocket-taper-exceeds-half-width', severity: 'warning' } },
    opening: getPocketOpeningLimits(adjusted, cluster, computed),
  }
}
