import BigNumber from 'bignumber.js'
import { CornerRadiusSchema } from '../schemas/geometry'

export const ZERO = new BigNumber(0)
export const ONE = new BigNumber(1)
export const TWO = new BigNumber(2)

export const ZERO_CORNER_RADIUS: CornerRadiusSchema = {
  bottomLeft: ZERO,
  bottomRight: ZERO,
  topLeft: ZERO,
  topRight: ZERO,
}

export const EXPORT_PAGE_GAP = 10
