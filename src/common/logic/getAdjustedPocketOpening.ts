import type { PocketOpeningSchema } from '../schemas/components'
import type { PocketOpeningLimitsSchema } from '../schemas/limits'
import { clamp } from '../utils/clamp'

/** Applies the calculated bounds without changing the requested opening. */
export const getAdjustedPocketOpening = (
  opening: PocketOpeningSchema,
  limits: PocketOpeningLimitsSchema,
): PocketOpeningSchema => {
  if (opening.type === 'slanted' && limits.type === 'slanted') {
    return {
      ...opening,
      offset: clamp(opening.offset, limits.offset?.min?.value, limits.offset?.max?.value).toNumber(),
    }
  }
  if (opening.type !== 'recessed' || limits.type !== 'recessed') {
    return opening
  }

  return {
    ...opening,
    outerInset: clamp(opening.outerInset, limits.outerInset?.min?.value, limits.outerInset?.max?.value).toNumber(),
    innerOffset: clamp(opening.innerOffset, limits.innerOffset?.min?.value, limits.innerOffset?.max?.value).toNumber(),
    depth: clamp(opening.depth, limits.depth?.min?.value, limits.depth?.max?.value).toNumber(),
    outerRadius: clamp(opening.outerRadius, limits.outerRadius?.min?.value, limits.outerRadius?.max?.value).toNumber(),
    innerRadius: clamp(opening.innerRadius, limits.innerRadius?.min?.value, limits.innerRadius?.max?.value).toNumber(),
  }
}
