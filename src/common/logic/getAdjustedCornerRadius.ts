import type { CornerRadiusSchema } from '../schemas/geometry'
import type { CornerRadiusLimitsSchema } from '../schemas/limits'
import { clamp } from '../utils/clamp'

/** Applies the already calculated bounds to the radii used by geometry. */
export const getAdjustedCornerRadius = (
  cornerRadius: CornerRadiusSchema,
  limits: CornerRadiusLimitsSchema,
): CornerRadiusSchema => ({
  topLeft: clamp(cornerRadius.topLeft, limits.topLeftRadius?.min?.value, limits.topLeftRadius?.max?.value),
  topRight: clamp(cornerRadius.topRight, limits.topRightRadius?.min?.value, limits.topRightRadius?.max?.value),
  bottomLeft: clamp(cornerRadius.bottomLeft, limits.bottomLeftRadius?.min?.value, limits.bottomLeftRadius?.max?.value),
  bottomRight: clamp(
    cornerRadius.bottomRight,
    limits.bottomRightRadius?.min?.value,
    limits.bottomRightRadius?.max?.value,
  ),
})
