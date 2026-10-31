import BigNumber from 'bignumber.js'

import { POSITION_EPSILON } from '../../constants/layout'
import type { HasStretchValuesSchema } from '../../schemas/common'
import type { RectSchema } from '../../schemas/geometry'
import type { NumericBoundSchema, StretchLimitsSchema } from '../../schemas/limits'

export const getStretchLimits = (stretch: HasStretchValuesSchema, boundingRect: RectSchema): StretchLimitsSchema => ({
  leftStretch: { min: getMinimumStretch(stretch.rightStretch, boundingRect.width) },
  rightStretch: { min: getMinimumStretch(stretch.leftStretch, boundingRect.width) },
  topStretch: { min: getMinimumStretch(stretch.bottomStretch, boundingRect.height) },
  bottomStretch: { min: getMinimumStretch(stretch.topStretch, boundingRect.height) },
})

const getMinimumStretch = (oppositeStretch: number, size: BigNumber): NumericBoundSchema => {
  const opposite = new BigNumber(oppositeStretch)
  const compressibleSize = size.minus(POSITION_EPSILON)
  const halfSize = compressibleSize.dividedBy(2)
  // Reserve a positive size before sharing the remaining compression between opposite edges.
  const value = opposite.lt(halfSize.negated()) ? halfSize.negated() : compressibleSize.plus(opposite).negated()
  return {
    value,
    reason: opposite.isZero() ? 'stretch-component-size' : 'stretch-opposite-edge',
    severity: 'warning',
  }
}
