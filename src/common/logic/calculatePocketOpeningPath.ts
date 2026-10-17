import type { PocketOpeningOwnSchema, PocketOrientationSchema } from '../schemas/components'
import type { PathSchema, RectSchema } from '../schemas/geometry'
import { calculateRecessedPocketOpeningPath } from './calculateRecessedPocketOpeningPath'
import { calculateStraightPocketOpeningPath } from './calculateStraightPocketOpeningPath'

export const calculatePocketOpeningPath = (
  adjustedOpening: PocketOpeningOwnSchema,
  pocketRect: RectSchema,
  orientation: PocketOrientationSchema,
): PathSchema => {
  switch (adjustedOpening.type) {
    case 'straight':
      return calculateStraightPocketOpeningPath(adjustedOpening, pocketRect, orientation)
    case 'recessed':
      return calculateRecessedPocketOpeningPath(adjustedOpening, pocketRect, orientation)
  }
}
