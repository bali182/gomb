import BigNumber from 'bignumber.js'
import type { PocketClusterSchema } from '../../schemas/components'
import type { CornerRadiusLimitsSchema, NumericFieldLimitsSchema } from '../../schemas/limits'
import { isDefined } from '../../utils/isDefined'
import { getCornerRadiusLimits, type GetCornerRadiusLimitsParams } from './getCornerRadiusLimits'

export type GetPocketClusterCornerRadiusLimitsParams = GetCornerRadiusLimitsParams & {
  pocketCluster: PocketClusterSchema
}

/** Opening-side cluster corners also obey the existing pocket-step maximum. */
export const getPocketClusterCornerRadiusLimits = ({
  pocketCluster,
  ...params
}: GetPocketClusterCornerRadiusLimitsParams): CornerRadiusLimitsSchema => {
  const limits = getCornerRadiusLimits(params)
  const step = new BigNumber(pocketCluster.pocketStep)
  switch (pocketCluster.orientation) {
    case 'up':
      return {
        ...limits,
        topLeftRadius: applyPocketStep(limits.topLeftRadius, step),
        topRightRadius: applyPocketStep(limits.topRightRadius, step),
      }
    case 'down':
      return {
        ...limits,
        bottomLeftRadius: applyPocketStep(limits.bottomLeftRadius, step),
        bottomRightRadius: applyPocketStep(limits.bottomRightRadius, step),
      }
    case 'left':
      return {
        ...limits,
        topLeftRadius: applyPocketStep(limits.topLeftRadius, step),
        bottomLeftRadius: applyPocketStep(limits.bottomLeftRadius, step),
      }
    case 'right':
      return {
        ...limits,
        topRightRadius: applyPocketStep(limits.topRightRadius, step),
        bottomRightRadius: applyPocketStep(limits.bottomRightRadius, step),
      }
  }
}

const applyPocketStep = (limits: NumericFieldLimitsSchema | undefined, step: BigNumber): NumericFieldLimitsSchema => {
  if (isDefined(limits?.max) && limits.max.value.lte(step)) {
    return limits
  }
  return {
    min: isDefined(limits?.min) ? { ...limits.min, value: BigNumber.minimum(limits.min.value, step) } : undefined,
    max: { value: step, reason: 'opening-corner-radius-exceeds-pocket-step', severity: 'warning' },
  }
}
