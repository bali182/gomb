import BigNumber from 'bignumber.js'

import type { CornerRadiusSchema } from '../schemas/geometry'
import type { CornerRadiusLimitsSchema, NumericFieldLimitsSchema } from '../schemas/limits'
import { isDefined } from '../utils/isDefined'

/** Applies the already calculated bounds to the radii used by geometry. */
export const getAdjustedCornerRadius = (
  cornerRadius: CornerRadiusSchema,
  limits: CornerRadiusLimitsSchema,
): CornerRadiusSchema => ({
  topLeft: applyLimits(cornerRadius.topLeft, limits.topLeftRadius),
  topRight: applyLimits(cornerRadius.topRight, limits.topRightRadius),
  bottomLeft: applyLimits(cornerRadius.bottomLeft, limits.bottomLeftRadius),
  bottomRight: applyLimits(cornerRadius.bottomRight, limits.bottomRightRadius),
})

const applyLimits = (radius: BigNumber, limits: NumericFieldLimitsSchema | undefined): BigNumber => {
  const lowerBounded = isDefined(limits?.min) ? BigNumber.maximum(radius, limits.min.value) : radius
  return isDefined(limits?.max) ? BigNumber.minimum(lowerBounded, limits.max.value) : lowerBounded
}
