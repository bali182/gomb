import type { FrontPocketSchema, PocketClusterSchema } from '../../schemas/components'
import type { ComputedFrontPocketSchema, ComputedPocketClusterSchema } from '../../schemas/computed'
import type { FrontPocketLimitsSchema } from '../../schemas/limits'
import { getCornerRadius } from '../cornerRadiusUtils'
import { getFrontPocketCornerRadiusLimits } from './getFrontPocketCornerRadiusLimits'
import { getPocketOpeningLimits } from './getPocketOpeningLimits'

export const getFrontPocketLimits = (
  pocket: FrontPocketSchema,
  computed: ComputedFrontPocketSchema,
  cluster: PocketClusterSchema,
  computedCluster: ComputedPocketClusterSchema,
): FrontPocketLimitsSchema => ({
  type: pocket.type,
  ...getFrontPocketCornerRadiusLimits(
    {
      boundingRect: computed.boundingRect,
      cornerRadius: getCornerRadius(pocket),
      parentBoundingRect: computedCluster.boundingRect,
      parentCornerRadius: computedCluster.cornerRadius,
    },
    cluster,
  ),
  opening: getPocketOpeningLimits(pocket, cluster, computed),
})
