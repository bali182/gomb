import BigNumber from 'bignumber.js'

import { isDefined } from './isDefined'

export const clamp = (value: number | BigNumber, min?: number | BigNumber, max?: number | BigNumber): BigNumber => {
  const lowerBounded = isDefined(min) ? BigNumber.maximum(value, min) : new BigNumber(value)
  return isDefined(max) ? BigNumber.minimum(lowerBounded, max) : lowerBounded
}
