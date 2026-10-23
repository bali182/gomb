import type { PocketClusterSchema } from '../../schemas/components'
import type { CornerRadiusLimitsSchema } from '../../schemas/limits'
import type { GetCornerRadiusLimitsParams } from './getCornerRadiusLimits'
import { getPocketClusterCornerRadiusLimits } from './getPocketClusterCornerRadiusLimits'

export const getFrontPocketCornerRadiusLimits = (
  params: GetCornerRadiusLimitsParams,
  cluster: PocketClusterSchema,
): CornerRadiusLimitsSchema => getPocketClusterCornerRadiusLimits({ ...params, pocketCluster: cluster })
