import type { PocketClusterSchema } from '../schemas/components'
import type { RectSchema } from '../schemas/geometry'
import { clamp } from '../utils/clamp'
import { getPocketsLimits } from './limits/getPocketsLimits'

export const normalizePocketCluster = (cluster: PocketClusterSchema, rect: RectSchema): PocketClusterSchema => {
  const limits = getPocketsLimits(cluster, rect)
  return { ...cluster, pocketStep: clamp(cluster.pocketStep, 0, limits.pocketStep?.max?.value).toNumber() }
}
