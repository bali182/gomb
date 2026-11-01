import type { PocketOpeningLimitsSchema } from '../schemas/limits'
import type { PocketOpeningSchema } from '../schemas/pocketOpening'
import { clamp } from '../utils/clamp'

/** Applies the calculated bounds without changing the requested opening. */
export const getAdjustedPocketOpening = (
  opening: PocketOpeningSchema,
  limits: PocketOpeningLimitsSchema,
): PocketOpeningSchema => {
  switch (opening.type) {
    case 'straight':
      return opening
    case 'slanted':
      if (limits.type !== 'slanted') {
        return opening
      }
      return {
        ...opening,
        offset: clamp(opening.offset, limits.offset?.min?.value, limits.offset?.max?.value).toNumber(),
      }
    case 'recessed':
      if (limits.type !== 'recessed') {
        return opening
      }
      return {
        ...opening,
        outerInset: clamp(opening.outerInset, limits.outerInset?.min?.value, limits.outerInset?.max?.value).toNumber(),
        innerOffset: clamp(
          opening.innerOffset,
          limits.innerOffset?.min?.value,
          limits.innerOffset?.max?.value,
        ).toNumber(),
        depth: clamp(opening.depth, limits.depth?.min?.value, limits.depth?.max?.value).toNumber(),
        outerRadius: clamp(
          opening.outerRadius,
          limits.outerRadius?.min?.value,
          limits.outerRadius?.max?.value,
        ).toNumber(),
        innerRadius: clamp(
          opening.innerRadius,
          limits.innerRadius?.min?.value,
          limits.innerRadius?.max?.value,
        ).toNumber(),
      }
    case 'optical-illusion':
      if (limits.type !== 'optical-illusion') {
        return opening
      }
      return {
        ...opening,
        startInset: clamp(opening.startInset, 0, limits.startInset?.max?.value).toNumber(),
        endInset: clamp(opening.endInset, 0, limits.endInset?.max?.value).toNumber(),
        leadingRadius: clamp(opening.leadingRadius, 0, limits.leadingRadius?.max?.value).toNumber(),
        trailingRadius: clamp(opening.trailingRadius, 0, limits.trailingRadius?.max?.value).toNumber(),
      }
  }
}
