import BigNumber from 'bignumber.js'

export const getSharedLengthMaximum = (otherLength: BigNumber, totalLength: BigNumber): BigNumber => {
  const halfLength = totalLength.dividedBy(2)
  return BigNumber.maximum(otherLength.gt(halfLength) ? halfLength : totalLength.minus(otherLength), 0)
}
