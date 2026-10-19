import BigNumber from 'bignumber.js'
import { describe, expect, it } from 'vitest'

import type { CornerRadiusSchema, NumberCornerRadiusSchema, RectSchema } from '../schemas/geometry'
import { getAdjustedCornerRadius } from './getAdjustedCornerRadius'
import { getCornerRadiusLimits } from './limits/getCornerRadiusLimits'

type EdgeConflictTestCase = {
  name: string
  cornerRadius: NumberCornerRadiusSchema
  expected: NumberCornerRadiusSchema
}

const rect = (width: number, height: number): RectSchema => ({
  x: new BigNumber(0),
  y: new BigNumber(0),
  width: new BigNumber(width),
  height: new BigNumber(height),
})

const cornerRadius = (radius: NumberCornerRadiusSchema): CornerRadiusSchema => ({
  topLeft: new BigNumber(radius.topLeft),
  topRight: new BigNumber(radius.topRight),
  bottomLeft: new BigNumber(radius.bottomLeft),
  bottomRight: new BigNumber(radius.bottomRight),
})

const expectCornerRadius = (actual: CornerRadiusSchema, expected: NumberCornerRadiusSchema) =>
  expect(actual).toEqual(cornerRadius(expected))

describe('getAdjustedCornerRadius', () => {
  it('keeps radii at or below the guaranteed radius unchanged', () => {
    const params = {
      boundingRect: rect(100, 60),
      cornerRadius: cornerRadius({ topLeft: 30, topRight: 29, bottomLeft: 1, bottomRight: 30 }),
    }
    const result = getAdjustedCornerRadius(params.cornerRadius, getCornerRadiusLimits(params))

    expectCornerRadius(result, { topLeft: 30, topRight: 29, bottomLeft: 1, bottomRight: 30 })
  })

  it('keeps a radius above the guaranteed radius when neither adjacent corner restricts it', () => {
    const params = {
      boundingRect: rect(120, 100),
      cornerRadius: cornerRadius({ topLeft: 70, topRight: 5, bottomLeft: 5, bottomRight: 0 }),
    }
    const result = getAdjustedCornerRadius(params.cornerRadius, getCornerRadiusLimits(params))

    expectCornerRadius(result, { topLeft: 70, topRight: 5, bottomLeft: 5, bottomRight: 0 })
  })

  it('keeps a radius above the guaranteed radius when it exactly fills the space left by its neighbour', () => {
    const params = {
      boundingRect: rect(100, 100),
      cornerRadius: cornerRadius({ topLeft: 70, topRight: 30, bottomLeft: 0, bottomRight: 0 }),
    }
    const result = getAdjustedCornerRadius(params.cornerRadius, getCornerRadiusLimits(params))

    expectCornerRadius(result, { topLeft: 70, topRight: 30, bottomLeft: 0, bottomRight: 0 })
  })

  it.each<EdgeConflictTestCase>([
    {
      name: 'top edge',
      cornerRadius: { topLeft: 60, topRight: 50, bottomLeft: 0, bottomRight: 0 },
      expected: { topLeft: 50, topRight: 50, bottomLeft: 0, bottomRight: 0 },
    },
    {
      name: 'bottom edge',
      cornerRadius: { topLeft: 0, topRight: 0, bottomLeft: 60, bottomRight: 50 },
      expected: { topLeft: 0, topRight: 0, bottomLeft: 50, bottomRight: 50 },
    },
    {
      name: 'left edge',
      cornerRadius: { topLeft: 60, topRight: 0, bottomLeft: 5, bottomRight: 0 },
      expected: { topLeft: 55, topRight: 0, bottomLeft: 5, bottomRight: 0 },
    },
    {
      name: 'right edge',
      cornerRadius: { topLeft: 0, topRight: 60, bottomLeft: 0, bottomRight: 5 },
      expected: { topLeft: 0, topRight: 55, bottomLeft: 0, bottomRight: 5 },
    },
  ])('only limits the above-guaranteed radius on the $name', (testCase) => {
    const params = {
      boundingRect: rect(100, 60),
      cornerRadius: cornerRadius(testCase.cornerRadius),
    }
    const result = getAdjustedCornerRadius(params.cornerRadius, getCornerRadiusLimits(params))

    expectCornerRadius(result, testCase.expected)
  })

  it.each<EdgeConflictTestCase>([
    {
      name: 'top edge',
      cornerRadius: { topLeft: 80, topRight: 60, bottomLeft: 0, bottomRight: 0 },
      expected: { topLeft: 50, topRight: 50, bottomLeft: 0, bottomRight: 0 },
    },
    {
      name: 'bottom edge',
      cornerRadius: { topLeft: 0, topRight: 0, bottomLeft: 80, bottomRight: 60 },
      expected: { topLeft: 0, topRight: 0, bottomLeft: 50, bottomRight: 50 },
    },
    {
      name: 'left edge',
      cornerRadius: { topLeft: 80, topRight: 0, bottomLeft: 60, bottomRight: 0 },
      expected: { topLeft: 30, topRight: 0, bottomLeft: 30, bottomRight: 0 },
    },
    {
      name: 'right edge',
      cornerRadius: { topLeft: 0, topRight: 80, bottomLeft: 0, bottomRight: 60 },
      expected: { topLeft: 0, topRight: 30, bottomLeft: 0, bottomRight: 30 },
    },
  ])('shares an edge equally when both radii exceed the guaranteed radius on the $name', (testCase) => {
    const params = {
      boundingRect: rect(100, 60),
      cornerRadius: cornerRadius(testCase.cornerRadius),
    }
    const result = getAdjustedCornerRadius(params.cornerRadius, getCornerRadiusLimits(params))

    expectCornerRadius(result, testCase.expected)
  })

  it('uses the stricter cap when a corner is limited by both adjacent edges', () => {
    const params = {
      boundingRect: rect(100, 60),
      cornerRadius: cornerRadius({ topLeft: 80, topRight: 50, bottomLeft: 5, bottomRight: 0 }),
    }
    const result = getAdjustedCornerRadius(params.cornerRadius, getCornerRadiusLimits(params))

    expectCornerRadius(result, { topLeft: 50, topRight: 50, bottomLeft: 5, bottomRight: 0 })
  })

  it('calculates the geometric cap after applying parent radii', () => {
    const boundingRect = rect(100, 60)
    const params = {
      boundingRect,
      cornerRadius: cornerRadius({ topLeft: 0, topRight: 0, bottomLeft: 0, bottomRight: 0 }),
      parentBoundingRect: boundingRect,
      parentCornerRadius: cornerRadius({ topLeft: 60, topRight: 50, bottomLeft: 0, bottomRight: 0 }),
    }
    const result = getAdjustedCornerRadius(params.cornerRadius, getCornerRadiusLimits(params))

    expectCornerRadius(result, { topLeft: 50, topRight: 50, bottomLeft: 0, bottomRight: 0 })
  })

  it('applies parent radii to every touching corner before calculating caps', () => {
    const boundingRect = rect(200, 200)
    const params = {
      boundingRect,
      cornerRadius: cornerRadius({ topLeft: 0, topRight: 0, bottomLeft: 0, bottomRight: 0 }),
      parentBoundingRect: boundingRect,
      parentCornerRadius: cornerRadius({ topLeft: 10, topRight: 20, bottomLeft: 30, bottomRight: 40 }),
    }
    const result = getAdjustedCornerRadius(params.cornerRadius, getCornerRadiusLimits(params))

    expectCornerRadius(result, { topLeft: 10, topRight: 20, bottomLeft: 30, bottomRight: 40 })
  })

  it('does not apply parent radii to corners that do not touch the parent', () => {
    const params = {
      boundingRect: rect(100, 60),
      cornerRadius: cornerRadius({ topLeft: 20, topRight: 0, bottomLeft: 0, bottomRight: 0 }),
      parentBoundingRect: { ...rect(200, 200), x: new BigNumber(10), y: new BigNumber(10) },
      parentCornerRadius: cornerRadius({ topLeft: 60, topRight: 60, bottomLeft: 60, bottomRight: 60 }),
    }
    const result = getAdjustedCornerRadius(params.cornerRadius, getCornerRadiusLimits(params))

    expectCornerRadius(result, { topLeft: 20, topRight: 0, bottomLeft: 0, bottomRight: 0 })
  })

  it('applies the supplied maximum to each corner', () => {
    const maximum = {
      value: new BigNumber(10),
      reason: 'corner-radius-exceeds-edge-length',
      severity: 'warning',
    } as const
    const result = getAdjustedCornerRadius(
      cornerRadius({ topLeft: 20, topRight: 20, bottomLeft: 20, bottomRight: 20 }),
      {
        topLeftRadius: { max: maximum },
        topRightRadius: { max: maximum },
        bottomLeftRadius: { max: maximum },
        bottomRightRadius: { max: maximum },
      },
    )
    expectCornerRadius(result, { topLeft: 10, topRight: 10, bottomLeft: 10, bottomRight: 10 })
  })

  it('leaves corners without bounds unchanged and accepts a zero maximum', () => {
    const result = getAdjustedCornerRadius(
      cornerRadius({ topLeft: 20, topRight: 20, bottomLeft: 20, bottomRight: 20 }),
      {
        topLeftRadius: {
          max: { value: new BigNumber(0), reason: 'corner-radius-exceeds-edge-length', severity: 'warning' },
        },
      },
    )
    expectCornerRadius(result, { topLeft: 0, topRight: 20, bottomLeft: 20, bottomRight: 20 })
  })

  it('applies a supplied minimum without changing the other corners', () => {
    const result = getAdjustedCornerRadius(
      cornerRadius({ topLeft: 0, topRight: 20, bottomLeft: 20, bottomRight: 20 }),
      { topLeftRadius: { min: { value: new BigNumber(15), reason: 'parent-corner-radius', severity: 'info' } } },
    )
    expectCornerRadius(result, { topLeft: 15, topRight: 20, bottomLeft: 20, bottomRight: 20 })
  })

  it.each([
    { width: 0, height: 60 },
    { width: -10, height: 60 },
    { width: 60, height: 0 },
    { width: 60, height: -10 },
  ])('does not produce a negative cap for a $width by $height bounding rect', ({ width, height }) => {
    const params = {
      boundingRect: rect(width, height),
      cornerRadius: cornerRadius({ topLeft: 10, topRight: 10, bottomLeft: 10, bottomRight: 10 }),
    }
    const result = getAdjustedCornerRadius(params.cornerRadius, getCornerRadiusLimits(params))

    expectCornerRadius(result, { topLeft: 0, topRight: 0, bottomLeft: 0, bottomRight: 0 })
  })
})
