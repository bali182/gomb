import { ZERO } from '../../constants/layout'
import type { PocketClusterSchema } from '../../schemas/components'
import type { RectSchema } from '../../schemas/geometry'
import type { PocketsLimitsSchema } from '../../schemas/limits'

export const getPocketsLimits = (cluster: PocketClusterSchema, rect: RectSchema): PocketsLimitsSchema => {
  const length = cluster.orientation === 'up' || cluster.orientation === 'down' ? rect.height : rect.width
  return {
    pocketStep: {
      max: {
        value: cluster.children.length === 0 ? ZERO : length.dividedBy(cluster.children.length),
        reason: 'cluster-size-and-pocket-count',
        severity: 'warning',
      },
    },
  }
}
