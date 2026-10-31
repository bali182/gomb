import BigNumber from 'bignumber.js'
import { describe, expect, it } from 'vitest'

import { POSITION_EPSILON } from '../../constants/layout'
import type { HasStretchValuesSchema } from '../../schemas/common'
import type { RectSchema } from '../../schemas/geometry'
import { getStretchLimits } from './getStretchLimits'

type StretchPairTestCase = {
  name: string
  size: number
  first: number
  second: number
  firstMinimum: BigNumber
  secondMinimum: BigNumber
}

const epsilon: BigNumber = new BigNumber(POSITION_EPSILON)
const halfEpsilon: BigNumber = epsilon.dividedBy(2)

describe.each([
  ['leftStretch', 'rightStretch'],
  ['topStretch', 'bottomStretch'],
] as const)('getStretchLimits: %s / %s', (firstField, secondField) => {
  it.each<StretchPairTestCase>([
    {
      name: 'no stretch',
      size: 100,
      first: 0,
      second: 0,
      firstMinimum: epsilon.minus(100),
      secondMinimum: epsilon.minus(100),
    },
    {
      name: 'one edge using the whole size',
      size: 100,
      first: -100,
      second: 0,
      firstMinimum: epsilon.minus(100),
      secondMinimum: halfEpsilon.minus(50),
    },
    {
      name: 'one edge exceeding the whole size',
      size: 100,
      first: -120,
      second: 0,
      firstMinimum: epsilon.minus(100),
      secondMinimum: halfEpsilon.minus(50),
    },
    {
      name: 'both edges fitting below halfway',
      size: 100,
      first: -40,
      second: -40,
      firstMinimum: epsilon.minus(60),
      secondMinimum: epsilon.minus(60),
    },
    {
      name: 'exactly halfway',
      size: 100,
      first: -50,
      second: -50,
      firstMinimum: halfEpsilon.minus(50),
      secondMinimum: halfEpsilon.minus(50),
    },
    {
      name: 'asymmetric compression exactly fitting',
      size: 100,
      first: -80,
      second: -20,
      firstMinimum: epsilon.minus(80),
      secondMinimum: halfEpsilon.minus(50),
    },
    {
      name: 'smaller edge displacing the larger edge',
      size: 100,
      first: -80,
      second: -30,
      firstMinimum: epsilon.minus(70),
      secondMinimum: halfEpsilon.minus(50),
    },
    {
      name: 'both edges past halfway',
      size: 100,
      first: -80,
      second: -80,
      firstMinimum: halfEpsilon.minus(50),
      secondMinimum: halfEpsilon.minus(50),
    },
    {
      name: 'extension providing additional space',
      size: 100,
      first: 30,
      second: -120,
      firstMinimum: halfEpsilon.minus(50),
      secondMinimum: epsilon.minus(130),
    },
    {
      name: 'compression exceeding additional space',
      size: 100,
      first: 30,
      second: -140,
      firstMinimum: halfEpsilon.minus(50),
      secondMinimum: epsilon.minus(130),
    },
    {
      name: 'both edges extending',
      size: 100,
      first: 20,
      second: 30,
      firstMinimum: epsilon.minus(130),
      secondMinimum: epsilon.minus(120),
    },
    {
      name: 'fractional asymmetric compression',
      size: 1.5,
      first: -0.9,
      second: -0.6,
      firstMinimum: epsilon.minus(0.9),
      secondMinimum: halfEpsilon.minus(0.75),
    },
    {
      name: 'compression below one millimeter',
      size: 0.5,
      first: -0.4,
      second: -0.2,
      firstMinimum: epsilon.minus(0.3),
      secondMinimum: halfEpsilon.minus(0.25),
    },
    {
      name: 'very small component',
      size: 0.00001,
      first: -0.000009,
      second: -0.000002,
      firstMinimum: epsilon.minus(0.000008),
      secondMinimum: halfEpsilon.minus(0.000005),
    },
    {
      name: 'zero size without stretch',
      size: 0,
      first: 0,
      second: 0,
      firstMinimum: halfEpsilon,
      secondMinimum: halfEpsilon,
    },
    {
      name: 'zero size with compression',
      size: 0,
      first: -10,
      second: -20,
      firstMinimum: halfEpsilon,
      secondMinimum: halfEpsilon,
    },
    {
      name: 'zero size extended before compression',
      size: 0,
      first: 20,
      second: -10,
      firstMinimum: halfEpsilon,
      secondMinimum: epsilon.minus(20),
    },
  ])('$name', ({ size, first, second, firstMinimum, secondMinimum }) => {
    const horizontal = firstField === 'leftStretch'
    const bounds: RectSchema = {
      x: new BigNumber(17),
      y: new BigNumber(29),
      width: new BigNumber(horizontal ? size : 37),
      height: new BigNumber(horizontal ? 43 : size),
    }
    const stretch: HasStretchValuesSchema = {
      topStretch: 0,
      rightStretch: 0,
      bottomStretch: 0,
      leftStretch: 0,
      [firstField]: first,
      [secondField]: second,
    }
    const snapshot = { ...stretch }
    const limits = getStretchLimits(stretch, bounds)
    expect(limits[firstField].min?.value.eq(firstMinimum)).toBe(true)
    expect(limits[secondField].min?.value.eq(secondMinimum)).toBe(true)
    expect(limits[firstField].min?.reason).toBe(second === 0 ? 'stretch-component-size' : 'stretch-opposite-edge')
    expect(limits[secondField].min?.reason).toBe(first === 0 ? 'stretch-component-size' : 'stretch-opposite-edge')
    for (const field of ['leftStretch', 'rightStretch', 'topStretch', 'bottomStretch'] as const) {
      expect(limits[field].min?.severity).toBe('warning')
      expect(limits[field].max).toBeUndefined()
    }
    const otherFirstField = horizontal ? 'topStretch' : 'leftStretch'
    const otherSecondField = horizontal ? 'bottomStretch' : 'rightStretch'
    const otherMinimum = epsilon.minus(horizontal ? 43 : 37)
    expect(limits[otherFirstField].min?.value.eq(otherMinimum)).toBe(true)
    expect(limits[otherSecondField].min?.value.eq(otherMinimum)).toBe(true)
    expect(stretch).toEqual(snapshot)
    expect(bounds.width.toNumber()).toBe(horizontal ? size : 37)
    expect(bounds.height.toNumber()).toBe(horizontal ? 43 : size)
    expect(bounds.x.toNumber()).toBe(17)
    expect(bounds.y.toNumber()).toBe(29)
  })

  it('mirrors the limits when opposite edges are swapped', () => {
    const bounds: RectSchema = {
      x: new BigNumber(0),
      y: new BigNumber(0),
      width: new BigNumber(100),
      height: new BigNumber(100),
    }
    const stretch: HasStretchValuesSchema = {
      topStretch: 0,
      rightStretch: 0,
      bottomStretch: 0,
      leftStretch: 0,
      [firstField]: -80,
      [secondField]: -30,
    }
    const original = getStretchLimits(stretch, bounds)
    const mirrored = getStretchLimits({ ...stretch, [firstField]: -30, [secondField]: -80 }, bounds)
    expect(mirrored[firstField]).toEqual(original[secondField])
    expect(mirrored[secondField]).toEqual(original[firstField])
  })
})
