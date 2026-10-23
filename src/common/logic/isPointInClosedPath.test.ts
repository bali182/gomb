import BigNumber from 'bignumber.js'
import { describe, expect, it } from 'vitest'

import { POSITION_EPSILON, ZERO_CORNER_RADIUS } from '../constants/layout'
import type { PathSchema, PointSchema } from '../schemas/geometry'
import { d } from '../testData'
import { calculateRectPath } from './calculateRectPath'
import { isPointInClosedPath } from './isPointInClosedPath'
import { createPocketCalculator } from './pockets/createPocketCalculator'

const point = (x: BigNumber.Value, y: BigNumber.Value): PointSchema => ({
  x: new BigNumber(x),
  y: new BigNumber(y),
})

describe('isPointInClosedPath', () => {
  it('counts the shared inner-arc junction once, before and after cutting a hole', () => {
    const path = createPocketCalculator(
      d.frontPocket({ id: 'front' }),
      d.pocketCluster({ id: 'cluster', orientation: 'right' }),
      {
        type: 'recessed',
        outerInset: 43.3,
        innerOffset: 8,
        depth: 10,
        outerRadius: 55,
        innerRadius: 8,
      },
      { ...point(0, 0), width: new BigNumber('72.6'), height: new BigNumber('102.6') },
      ZERO_CORNER_RADIUS,
    ).getFrontPocketPath()
    const hole = calculateRectPath(
      { ...point('33.3', '48.3'), width: new BigNumber(6), height: new BigNumber(6) },
      ZERO_CORNER_RADIUS,
    )
    const probe = point('36.3', '51.3')

    expect(isPointInClosedPath(probe, path)).toBe(true)
    expect(isPointInClosedPath(probe, { commands: [...path.commands, ...hole.commands] })).toBe(false)
  })

  it('does not merge distinct intersections outside the coordinate tolerance', () => {
    const width = new BigNumber(POSITION_EPSILON).times(4)
    const path = calculateRectPath({ ...point(10, 0), width, height: new BigNumber(10) }, ZERO_CORNER_RADIUS)

    expect(isPointInClosedPath(point(0, 5), path)).toBe(false)
    expect(isPointInClosedPath(point(new BigNumber(10).plus(width.dividedBy(2)), 5), path)).toBe(true)
    expect(isPointInClosedPath(point(new BigNumber(10).plus(width.times(2)), 5), path)).toBe(false)
  })

  it.each(['0.0001', '1', '1000000'])('uses the same radial distance tolerance for radius %s', (value) => {
    const radius = new BigNumber(value)
    const path: PathSchema = {
      commands: [
        { type: 'moveTo', point: point(radius, 0) },
        { type: 'arcTo', point: point(radius.negated(), 0), radius, reversed: false },
        { type: 'arcTo', point: point(radius, 0), radius, reversed: false },
        { type: 'close' },
      ],
    }
    const epsilon = new BigNumber(POSITION_EPSILON)
    expect(isPointInClosedPath(point(0, radius.plus(epsilon.dividedBy(2))), path)).toBe(true)
    expect(isPointInClosedPath(point(0, radius.plus(epsilon.times(2))), path)).toBe(false)
    expect(isPointInClosedPath(point(0, radius.minus(epsilon.times(2))), path)).toBe(true)
  })
})
