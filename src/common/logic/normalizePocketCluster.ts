import BigNumber from 'bignumber.js'

import type { PocketClusterSchema } from '../schemas/components'
import type { RectSchema } from '../schemas/geometry'
import { clamp } from '../utils/clamp'
import { getPocketsLimits } from './limits/getPocketsLimits'

export const normalizePocketCluster = (pocketCluster: PocketClusterSchema, rect: RectSchema): PocketClusterSchema => {
  const pocketCount = BigNumber.maximum(
    new BigNumber(pocketCluster.pocketCount).integerValue(BigNumber.ROUND_FLOOR),
    new BigNumber(1),
  )
  const normalized: PocketClusterSchema = { ...pocketCluster, pocketCount: pocketCount.toNumber() }
  const limits = getPocketsLimits(normalized, rect)

  return {
    ...normalized,
    pocketStep: clamp(normalized.pocketStep, 0, limits.pocketStep?.max?.value).toNumber(),
    tPocketTabWidth: clamp(normalized.tPocketTabWidth, 0, limits.tPocketTabWidth?.max?.value).toNumber(),
    tPocketTaper: clamp(normalized.tPocketTaper, 0, limits.tPocketTaper?.max?.value).toNumber(),
  }
}
