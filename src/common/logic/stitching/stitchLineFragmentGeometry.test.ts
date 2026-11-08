import BigNumber from 'bignumber.js'
import { describe, expect, it } from 'vitest'
import { POSITION_EPSILON } from '../../constants/layout'
import type { StitchCornerPathFragment, StitchSidePathFragment } from '../../schemas/computed'
import type { PointSchema } from '../../schemas/geometry'
import { getPointDistance } from '../geometryUtils'
import {
  getStitchPathFragmentLength,
  getStitchPathFragmentRange,
  getStitchPathFragmentsLength,
} from './stitchLineFragmentGeometry'

const point = (x: number, y: number): PointSchema => ({ x: new BigNumber(x), y: new BigNumber(y) })
const corner: StitchCornerPathFragment = {
  type: 'corner',
  corner: 'top-right',
  start: point(0, -10),
  end: point(10, 0),
  center: point(0, 0),
  radius: new BigNumber(10),
}
const side: StitchSidePathFragment = {
  type: 'side',
  side: 'top',
  start: point(-20, -10),
  end: corner.start,
}

describe('stitch fragment geometry', () => {
  it('measures the arc rather than the chord and adds complete route lengths', () => {
    expect(getStitchPathFragmentLength(corner).toNumber()).toBeCloseTo(5 * Math.PI, 12)
    expect(getStitchPathFragmentLength(corner).gt(getPointDistance(corner.start, corner.end))).toBe(true)
    expect(getStitchPathFragmentsLength([side, corner]).toNumber()).toBeCloseTo(20 + 5 * Math.PI, 12)
  })

  it('cuts a smaller sector from the same circle and retains exact unchanged endpoints', () => {
    const range = getStitchPathFragmentRange(corner, new BigNumber(0.25), new BigNumber(0.75))
    expect(range).toMatchObject({ center: corner.center, radius: corner.radius, corner: corner.corner })
    expect(getStitchPathFragmentLength(range).toNumber()).toBeCloseTo(2.5 * Math.PI, 12)
    expect(getPointDistance(range.start, corner.center).toNumber()).toBeCloseTo(10, 12)
    expect(getPointDistance(range.end, corner.center).toNumber()).toBeCloseTo(10, 12)
    expect(getStitchPathFragmentRange(corner, new BigNumber(0), new BigNumber(0.5)).start).toBe(corner.start)
    expect(getStitchPathFragmentRange(corner, new BigNumber(0.5), new BigNumber(1)).end).toBe(corner.end)
  })

  it('cuts straight fragments by length without modifying their source', () => {
    const range = getStitchPathFragmentRange(side, new BigNumber(0.25), new BigNumber(0.75))
    expect(range.start.x.toNumber()).toBe(-15)
    expect(range.end.x.toNumber()).toBe(-5)
    expect(getStitchPathFragmentLength(range).toNumber()).toBe(10)
    expect(side.start.x.toNumber()).toBe(-20)
    expect(side.end).toBe(corner.start)
  })

  it('keeps epsilon-length partial arcs measurable, including cuts from both ends', () => {
    const length = getStitchPathFragmentLength(corner)
    const startProgress = new BigNumber(0.5)
    const endProgress = startProgress.plus(new BigNumber(POSITION_EPSILON).dividedBy(length))
    const range = getStitchPathFragmentRange(corner, startProgress, endProgress)
    const remaining = getStitchPathFragmentLength(range)
    expect(remaining.gt(0)).toBe(true)
    expect(remaining.toNumber()).toBeCloseTo(POSITION_EPSILON, 12)
  })

  it('represents a sharp corner as a zero-length semantic fragment', () => {
    const sharp: StitchCornerPathFragment = {
      ...corner,
      start: corner.center,
      end: corner.center,
      radius: new BigNumber(0),
    }
    expect(getStitchPathFragmentLength(sharp).isZero()).toBe(true)
    expect(getStitchPathFragmentRange(sharp, new BigNumber(0), new BigNumber(1))).toEqual(sharp)
    expect(getStitchPathFragmentsLength([]).isZero()).toBe(true)
  })
})
