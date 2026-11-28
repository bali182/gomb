import BigNumber from 'bignumber.js'
import { describe, expect, it } from 'vitest'
import { getSharedLengthMaximum } from './getSharedLengthMaximum'

describe('getSharedLengthMaximum', () => {
  it.each([
    [0, 100, 100],
    [10, 100, 90],
    [30, 100, 70],
    [50, 100, 50],
    [70, 100, 50],
    [100, 100, 50],
    [200, 100, 50],
    [0, 0, 0],
    [10, 0, 0],
  ])('shares %s against %s with a maximum of %s', (otherLength, totalLength, expected) => {
    expect(getSharedLengthMaximum(new BigNumber(otherLength), new BigNumber(totalLength)).toNumber()).toBe(expected)
  })
})
