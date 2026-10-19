import BigNumber from 'bignumber.js'
import { CornerRadiusSchema } from '../schemas/geometry'

export const ZERO = new BigNumber(0)
export const ONE = new BigNumber(1)
export const TWO = new BigNumber(2)

// Shared coordinate tolerance in mm, matching Cavalier's positional precision.
export const POSITION_EPSILON = 1e-8
export const AREA_EPSILON = POSITION_EPSILON * POSITION_EPSILON

// Search termination and stitch endpoint placement have their own intentional tolerances.
export const OUTER_RADIUS_SEARCH_PRECISION = new BigNumber('0.001')
export const STITCH_HOLE_ENDPOINT_EPSILON_MM = new BigNumber('0.0001')

export const ZERO_CORNER_RADIUS: CornerRadiusSchema = {
  bottomLeft: ZERO,
  bottomRight: ZERO,
  topLeft: ZERO,
  topRight: ZERO,
}

export const EXPORT_PAGE_GAP = 10
