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
        slantOffset: clamp(
          opening.slantOffset,
          limits.slantOffset?.min?.value,
          limits.slantOffset?.max?.value,
        ).toNumber(),
      }
    case 'recessed':
      if (limits.type !== 'recessed') {
        return opening
      }
      return {
        ...opening,
        recessOuterInset: clamp(
          opening.recessOuterInset,
          limits.recessOuterInset?.min?.value,
          limits.recessOuterInset?.max?.value,
        ).toNumber(),
        recessInnerOffset: clamp(
          opening.recessInnerOffset,
          limits.recessInnerOffset?.min?.value,
          limits.recessInnerOffset?.max?.value,
        ).toNumber(),
        recessDepth: clamp(
          opening.recessDepth,
          limits.recessDepth?.min?.value,
          limits.recessDepth?.max?.value,
        ).toNumber(),
        recessOuterRadius: clamp(
          opening.recessOuterRadius,
          limits.recessOuterRadius?.min?.value,
          limits.recessOuterRadius?.max?.value,
        ).toNumber(),
        recessInnerRadius: clamp(
          opening.recessInnerRadius,
          limits.recessInnerRadius?.min?.value,
          limits.recessInnerRadius?.max?.value,
        ).toNumber(),
      }
    case 'optical-illusion':
      if (limits.type !== 'optical-illusion') {
        return opening
      }
      return {
        ...opening,
        illusionStartInset: clamp(opening.illusionStartInset, 0, limits.illusionStartInset?.max?.value).toNumber(),
        illusionEndInset: clamp(opening.illusionEndInset, 0, limits.illusionEndInset?.max?.value).toNumber(),
        illusionLeadingRadius: clamp(
          opening.illusionLeadingRadius,
          0,
          limits.illusionLeadingRadius?.max?.value,
        ).toNumber(),
        illusionTrailingRadius: clamp(
          opening.illusionTrailingRadius,
          0,
          limits.illusionTrailingRadius?.max?.value,
        ).toNumber(),
      }
  }
}
