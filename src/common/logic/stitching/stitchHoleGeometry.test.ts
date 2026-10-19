import BigNumber from 'bignumber.js'
import { describe, expect, it } from 'vitest'

import { POSITION_EPSILON } from '../../constants/layout'
import type { PointSchema } from '../../schemas/geometry'
import { findNextStitchHole, type StitchHoleLineSegment } from './stitchHoleGeometry'

const point = (x: BigNumber.Value, y: BigNumber.Value): PointSchema => ({
  x: new BigNumber(x),
  y: new BigNumber(y),
})

describe('findNextStitchHole coordinate precision', () => {
  it('advances by physical distance on long segments even when the normalized progress is very small', () => {
    const start = point(0, 0)
    const segment: StitchHoleLineSegment = { type: 'line', start, end: point('10000000000', 0) }
    const next = findNextStitchHole(start, new BigNumber('0.001'), [segment], { segmentIndex: 0, point: start })

    expect(next?.center.x.toNumber()).toBeCloseTo(0.001, 12)
    expect(next?.center.y.toNumber()).toBe(0)
  })

  it('does not advance by less than the shared coordinate tolerance', () => {
    const start = point(0, 0)
    const segment: StitchHoleLineSegment = {
      type: 'line',
      start,
      end: point(new BigNumber(POSITION_EPSILON).dividedBy(2), 0),
    }
    expect(
      findNextStitchHole(start, new BigNumber(POSITION_EPSILON).dividedBy(4), [segment], {
        segmentIndex: 0,
        point: start,
      }),
    ).toBeUndefined()
  })

  it.each([
    { endpoint: '3.99995', expected: '3.99995' },
    { endpoint: '3.9998', expected: undefined },
  ])('preserves endpoint placement tolerance for an endpoint at $endpoint', ({ endpoint, expected }) => {
    const start = point(0, 0)
    const segment: StitchHoleLineSegment = { type: 'line', start, end: point(endpoint, 0) }
    const next = findNextStitchHole(start, new BigNumber(4), [segment], { segmentIndex: 0, point: start })

    expect(next?.center.x.toString()).toBe(expected)
  })
})
