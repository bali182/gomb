import type { PocketOrientationSchema, PocketTopOwnSchema } from '../schemas/components'
import type { PathSchema, RectSchema } from '../schemas/geometry'
import { calculateRecessedPocketTopPath } from './calculateRecessedPocketTopPath'
import { calculateStraightPocketTopPath } from './calculateStraightPocketTopPath'

export const calculatePocketTopPath = (
  adjustedPocketTop: PocketTopOwnSchema,
  pocketRect: RectSchema,
  orientation: PocketOrientationSchema,
): PathSchema => {
  switch (adjustedPocketTop.type) {
    case 'straight':
      return calculateStraightPocketTopPath(adjustedPocketTop, pocketRect, orientation)
    case 'recessed':
      return calculateRecessedPocketTopPath(adjustedPocketTop, pocketRect, orientation)
  }
}
