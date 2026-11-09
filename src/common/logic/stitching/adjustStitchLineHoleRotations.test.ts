import BigNumber from 'bignumber.js'
import { describe, expect, it } from 'vitest'
import type { ComputedStitchHoleSchema } from '../../schemas/computed'
import { getPointDistance } from '../geometryUtils'
import {
  adjustStitchLineHoleRotations,
  CLOSED_STITCH_HOLE_DISTANCE_TOLERANCE_MM,
} from './adjustStitchLineHoleRotations'
import { getStitchHoleLine } from './getStitchHoleLine'

const point = (x: BigNumber.Value, y: BigNumber.Value) => ({ x: new BigNumber(x), y: new BigNumber(y) })
const createHole = (
  x: BigNumber.Value,
  y: BigNumber.Value,
  rotation: number,
  length: number = 2,
): ComputedStitchHoleSchema => {
  const center = point(x, y)
  return { center, rotation, line: getStitchHoleLine(center, rotation, length) }
}
const straightStitchLength = (distance: number, length: number): number => {
  const first = getStitchHoleLine(point(0, 0), 270, length)
  const second = getStitchHoleLine(point(distance, 0), 270, length)
  return getPointDistance(first.end, second.start).toNumber()
}

describe('adjustStitchLineHoleRotations', () => {
  it.each([45, 225])('reaches the target length and selects the solution closest to %s degrees', (rotation) => {
    const first = createHole(-1, 0, -45)
    const second = createHole(3, 0, rotation)
    const adjusted = adjustStitchLineHoleRotations([first, second], new Set([second]), 4, 2, false)
    expect(adjusted[0]).toBe(first)
    expect(getPointDistance(adjusted[0].line.end, adjusted[1].line.start).toNumber()).toBeCloseTo(
      straightStitchLength(4, 2),
      10,
    )
    expect(adjusted[1].line.start.y.isNegative()).toBe(rotation === 45)
    expect(adjusted[1].center).toBe(second.center)
    expect(getPointDistance(adjusted[1].line.start, adjusted[1].line.end).toNumber()).toBeCloseTo(2, 10)
  })

  it.each([
    { centerX: 100, distance: 4, expectedLength: 99 },
    { centerX: 1, distance: 10, expectedLength: 2 },
  ])('chooses the nearest reachable length when centerX=$centerX and distance=$distance', (testCase) => {
    const first = createHole(-1, 0, -45)
    const second = createHole(testCase.centerX, 0, 0)
    const adjusted = adjustStitchLineHoleRotations([first, second], new Set([second]), testCase.distance, 2, false)
    expect(getPointDistance(adjusted[0].line.end, adjusted[1].line.start).toNumber()).toBeCloseTo(
      testCase.expectedLength,
      10,
    )
  })

  it('uses the already adjusted previous hole for the next correction', () => {
    const holes = [createHole(-1, 0, -45), createHole(3, 0, 45), createHole(5, 2, 90)]
    const adjusted = adjustStitchLineHoleRotations(holes, new Set(holes.slice(1)), 4, 2, false)
    for (let index = 1; index < adjusted.length; index += 1) {
      expect(getPointDistance(adjusted[index - 1].line.end, adjusted[index].line.start).toNumber()).toBeCloseTo(
        straightStitchLength(4, 2),
        10,
      )
    }
  })

  it('leaves holes outside the rounded-hole Set unchanged', () => {
    const holes = [createHole(0, 0, 270), createHole(4, 0, 270), createHole(8, 0, 0)]
    const adjusted = adjustStitchLineHoleRotations(holes, new Set(), 4, 2, false)
    for (let index = 0; index < holes.length; index += 1) {
      expect(adjusted[index]).toBe(holes[index])
    }
  })

  it('ignores rounded-hole references removed from the final hole list', () => {
    const holes = [createHole(-1, 0, -45), createHole(3, 0, 45)]
    const removed = createHole(5, 2, 90)
    expect(adjustStitchLineHoleRotations(holes, new Set([holes[1], removed]), 4, 2, false)).toEqual(
      adjustStitchLineHoleRotations(holes, new Set([holes[1]]), 4, 2, false),
    )
  })

  it('preserves zero-length holes and a hole centered on the previous outgoing endpoint', () => {
    const zeroLength = [createHole(0, 0, 0, 0), createHole(3, 0, 90, 0)]
    expect(adjustStitchLineHoleRotations(zeroLength, new Set(zeroLength), 4, 0, false)).toEqual(zeroLength)
    const first = createHole(-1, 0, -45)
    const second = createHole(first.line.end.x, first.line.end.y, 90)
    expect(adjustStitchLineHoleRotations([first, second], new Set([second]), 4, 2, false)[1]).toBe(second)
  })

  it.each([
    { name: 'inside', toleranceFactor: 0.5, preserved: false },
    { name: 'on the boundary', toleranceFactor: 1, preserved: false },
    { name: 'outside', toleranceFactor: 2, preserved: true },
  ])('handles closing distance $name the configured tolerance', ({ toleranceFactor, preserved }) => {
    const distance = CLOSED_STITCH_HOLE_DISTANCE_TOLERANCE_MM * 10 + 10
    const closingDistance = new BigNumber(distance).plus(
      new BigNumber(CLOSED_STITCH_HOLE_DISTANCE_TOLERANCE_MM).times(toleranceFactor),
    )
    const holes = [createHole(0, 0, 0), createHole(distance / 2, 2, 0), createHole(closingDistance, 0, 0)]
    const adjusted = adjustStitchLineHoleRotations(holes, new Set(holes), distance, 2, true)
    expect(adjusted[0]).toBe(holes[0])
    expect(adjusted[2] === holes[2]).toBe(preserved)
    expect(adjusted[1]).not.toBe(holes[1])
    if (preserved) {
      expect(getPointDistance(adjusted[2].line.end, adjusted[0].line.start)).toEqual(
        getPointDistance(holes[2].line.end, holes[0].line.start),
      )
      expect(adjustStitchLineHoleRotations(holes, new Set(holes), distance, 2, false)[2]).not.toBe(holes[2])
    }
  })

  it('handles an empty route and a single hole', () => {
    expect(adjustStitchLineHoleRotations([], new Set(), 4, 2, true)).toEqual([])
    const first = createHole(0, 0, 0)
    expect(adjustStitchLineHoleRotations([first], new Set([first]), 4, 2, true)).toEqual([first])
  })
})
