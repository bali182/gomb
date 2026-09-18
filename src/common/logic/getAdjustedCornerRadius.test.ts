import BigNumber from 'bignumber.js'
import { describe, expect, it } from 'vitest'

import type { CornerRadiusSchema, NumberCornerRadiusSchema, RectSchema } from '../schemas/geometry'
import { getAdjustedCornerRadius } from './getAdjustedCornerRadius'

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
    const result = getAdjustedCornerRadius({
      boundingRect: rect(100, 60),
      cornerRadius: cornerRadius({ topLeft: 30, topRight: 29, bottomLeft: 1, bottomRight: 30 }),
    })

    expectCornerRadius(result, { topLeft: 30, topRight: 29, bottomLeft: 1, bottomRight: 30 })
  })

  it('keeps a radius above the guaranteed radius when neither adjacent corner restricts it', () => {
    const result = getAdjustedCornerRadius({
      boundingRect: rect(120, 100),
      cornerRadius: cornerRadius({ topLeft: 70, topRight: 5, bottomLeft: 5, bottomRight: 0 }),
    })

    expectCornerRadius(result, { topLeft: 70, topRight: 5, bottomLeft: 5, bottomRight: 0 })
  })

  it('keeps a radius above the guaranteed radius when it exactly fills the space left by its neighbour', () => {
    const result = getAdjustedCornerRadius({
      boundingRect: rect(100, 100),
      cornerRadius: cornerRadius({ topLeft: 70, topRight: 30, bottomLeft: 0, bottomRight: 0 }),
    })

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
    const result = getAdjustedCornerRadius({
      boundingRect: rect(100, 60),
      cornerRadius: cornerRadius(testCase.cornerRadius),
    })

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
    const result = getAdjustedCornerRadius({
      boundingRect: rect(100, 60),
      cornerRadius: cornerRadius(testCase.cornerRadius),
    })

    expectCornerRadius(result, testCase.expected)
  })

  it('uses the stricter cap when a corner is limited by both adjacent edges', () => {
    const result = getAdjustedCornerRadius({
      boundingRect: rect(100, 60),
      cornerRadius: cornerRadius({ topLeft: 80, topRight: 50, bottomLeft: 5, bottomRight: 0 }),
    })

    expectCornerRadius(result, { topLeft: 50, topRight: 50, bottomLeft: 5, bottomRight: 0 })
  })

  it('calculates the geometric cap after applying parent radii', () => {
    const boundingRect = rect(100, 60)
    const result = getAdjustedCornerRadius({
      boundingRect,
      cornerRadius: cornerRadius({ topLeft: 0, topRight: 0, bottomLeft: 0, bottomRight: 0 }),
      parentBoundingRect: boundingRect,
      parentCornerRadius: cornerRadius({ topLeft: 60, topRight: 50, bottomLeft: 0, bottomRight: 0 }),
    })

    expectCornerRadius(result, { topLeft: 50, topRight: 50, bottomLeft: 0, bottomRight: 0 })
  })

  it('applies parent radii to every touching corner before calculating caps', () => {
    const boundingRect = rect(200, 200)
    const result = getAdjustedCornerRadius({
      boundingRect,
      cornerRadius: cornerRadius({ topLeft: 0, topRight: 0, bottomLeft: 0, bottomRight: 0 }),
      parentBoundingRect: boundingRect,
      parentCornerRadius: cornerRadius({ topLeft: 10, topRight: 20, bottomLeft: 30, bottomRight: 40 }),
    })

    expectCornerRadius(result, { topLeft: 10, topRight: 20, bottomLeft: 30, bottomRight: 40 })
  })

  it('does not apply parent radii to corners that do not touch the parent', () => {
    const result = getAdjustedCornerRadius({
      boundingRect: rect(100, 60),
      cornerRadius: cornerRadius({ topLeft: 20, topRight: 0, bottomLeft: 0, bottomRight: 0 }),
      parentBoundingRect: { ...rect(200, 200), x: new BigNumber(10), y: new BigNumber(10) },
      parentCornerRadius: cornerRadius({ topLeft: 60, topRight: 60, bottomLeft: 60, bottomRight: 60 }),
    })

    expectCornerRadius(result, { topLeft: 20, topRight: 0, bottomLeft: 0, bottomRight: 0 })
  })

  it('applies a uniform explicit cap as a hard cap', () => {
    const result = getAdjustedCornerRadius({
      boundingRect: rect(100, 60),
      cornerRadius: cornerRadius({ topLeft: 20, topRight: 20, bottomLeft: 20, bottomRight: 20 }),
      radiusCap: new BigNumber(10),
    })

    expectCornerRadius(result, { topLeft: 10, topRight: 10, bottomLeft: 10, bottomRight: 10 })
  })

  it('applies partial explicit caps without changing uncapped corners', () => {
    const result = getAdjustedCornerRadius({
      boundingRect: rect(100, 60),
      cornerRadius: cornerRadius({ topLeft: 60, topRight: 50, bottomLeft: 0, bottomRight: 0 }),
      radiusCap: { topLeft: new BigNumber(40) },
    })

    expectCornerRadius(result, { topLeft: 40, topRight: 50, bottomLeft: 0, bottomRight: 0 })
  })

  it('treats zero as a valid partial explicit cap', () => {
    const result = getAdjustedCornerRadius({
      boundingRect: rect(100, 60),
      cornerRadius: cornerRadius({ topLeft: 20, topRight: 20, bottomLeft: 20, bottomRight: 20 }),
      radiusCap: { topLeft: new BigNumber(0) },
    })

    expectCornerRadius(result, { topLeft: 0, topRight: 20, bottomLeft: 20, bottomRight: 20 })
  })

  it('uses the geometric cap when it is stricter than an explicit cap', () => {
    const result = getAdjustedCornerRadius({
      boundingRect: rect(100, 60),
      cornerRadius: cornerRadius({ topLeft: 60, topRight: 0, bottomLeft: 5, bottomRight: 0 }),
      radiusCap: { topLeft: new BigNumber(80) },
    })

    expectCornerRadius(result, { topLeft: 55, topRight: 0, bottomLeft: 5, bottomRight: 0 })
  })

  it.each([
    { width: 0, height: 60 },
    { width: -10, height: 60 },
    { width: 60, height: 0 },
    { width: 60, height: -10 },
  ])('does not produce a negative cap for a $width by $height bounding rect', ({ width, height }) => {
    const result = getAdjustedCornerRadius({
      boundingRect: rect(width, height),
      cornerRadius: cornerRadius({ topLeft: 10, topRight: 10, bottomLeft: 10, bottomRight: 10 }),
    })

    expectCornerRadius(result, { topLeft: 0, topRight: 0, bottomLeft: 0, bottomRight: 0 })
  })
})
