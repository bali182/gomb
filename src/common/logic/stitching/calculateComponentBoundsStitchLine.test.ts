import BigNumber from 'bignumber.js'
import { describe, expect, it } from 'vitest'
import { POSITION_EPSILON, ZERO_CORNER_RADIUS } from '../../constants/layout'
import { defaultComponentBoundsStitchLine, defaultStitchingSettings } from '../../defaultStates'
import type { ComputedStitchHoleSchema, ComputedStitchLineSchema } from '../../schemas/computed'
import type { ResolvedComponentBoundsStitchLineSchema } from '../../schemas/stitching'
import { getPointDistance } from '../geometryUtils'
import { calculateComponentBoundsStitchLine } from './calculateComponentBoundsStitchLine'
import type { ComponentBoundsStitchLineTarget } from './helperTypes'

const target: ComponentBoundsStitchLineTarget = {
  componentId: 'root',
  boundingRect: { x: new BigNumber(0), y: new BigNumber(0), width: new BigNumber(100), height: new BigNumber(80) },
  cornerRadius: ZERO_CORNER_RADIUS,
}
const stitchLine = (
  overrides: Partial<ResolvedComponentBoundsStitchLineSchema> = {},
): ResolvedComponentBoundsStitchLineSchema => ({
  ...defaultStitchingSettings,
  ...defaultComponentBoundsStitchLine,
  id: 'stitch',
  name: 'Stitch',
  type: 'component-bounds-stitch-line',
  targetId: 'root',
  targetType: 'component',
  stitchMargin: 0,
  stitchHoleDistance: 30,
  autoCornerRadius: false,
  top: true,
  right: false,
  bottom: false,
  left: false,
  topLeftCorner: false,
  topRightCorner: false,
  bottomLeftCorner: false,
  bottomRightCorner: false,
  ...overrides,
})
const calculate = (overrides: Partial<ResolvedComponentBoundsStitchLineSchema> = {}): ComputedStitchLineSchema => {
  return calculateComponentBoundsStitchLine(stitchLine(overrides), target, {})
}
const centers = (holes: ComputedStitchHoleSchema[]): number[][] =>
  holes.map((hole) => [hole.center.x.toNumber(), hole.center.y.toNumber()])

describe('component bounds stitch routes', () => {
  it('returns no routes for an empty boundary or a standalone sharp corner', () => {
    expect(calculate({ top: false }).routes).toEqual([])
    expect(calculate({ top: false, topLeftCorner: true }).routes).toEqual([])
  })

  it('supports a standalone rounded corner and both arc directions', () => {
    const value = { top: false, topLeftCorner: true, topLeftRadius: 20, stitchHoleDistance: 5 }
    const forward = calculate(value).routes[0]
    const reverse = calculate({ ...value, stitchDirection: 'end-to-start' }).routes[0]
    expect(centers(forward.holes)[0]).toEqual([0, 20])
    expect(centers(reverse.holes)[0]).toEqual([20, 0])
    expect(forward.holes.length).toBeGreaterThan(3)
    expect(reverse.path.commands[1]).toMatchObject({ type: 'arcTo', reversed: true })
    expect(forward.fragments).toHaveLength(1)
    expect(forward.fragments[0]).toMatchObject({ type: 'corner', corner: 'top-left', radius: new BigNumber(20) })
    expect(reverse.fragments).toEqual(forward.fragments)
    for (const route of [forward, reverse]) {
      for (let index = 1; index < route.holes.length; index += 1) {
        expect(getPointDistance(route.holes[index - 1].center, route.holes[index].center).toNumber()).toBeCloseTo(5, 7)
      }
    }
  })

  it('applies offsets to canonical endpoints before choosing the punching direction', () => {
    const value = { startOffset: 20, endOffset: -10, stitchHoleDistance: 25 }
    const forward = calculate(value).routes[0]
    const reverse = calculate({ ...value, stitchDirection: 'end-to-start' }).routes[0]
    expect(centers(forward.holes)).toEqual([
      [-20, 0],
      [5, 0],
      [30, 0],
      [55, 0],
      [80, 0],
    ])
    expect(centers(reverse.holes)).toEqual([
      [90, 0],
      [65, 0],
      [40, 0],
      [15, 0],
      [-10, 0],
    ])
    expect(forward.boundingRect).toEqual(reverse.boundingRect)
    expect(forward.fragments).toEqual([
      {
        type: 'side',
        side: 'top',
        start: { x: new BigNumber(-20), y: new BigNumber(0) },
        end: { x: new BigNumber(90), y: new BigNumber(0) },
      },
    ])
    expect(reverse.fragments).toEqual(forward.fragments)
  })

  it('ignores offsets at corner endpoints without resetting their saved values', () => {
    const value = { topLeftCorner: true, topLeftRadius: 20, startOffset: 999 }
    expect(calculate(value)).toEqual(calculate({ ...value, startOffset: 0 }))
  })

  it('keeps a positive length when both ends try to consume the same side', () => {
    const route = calculate({ startOffset: -1000, endOffset: -1000 }).routes[0]
    expect(route.boundingRect.width.toNumber()).toBeCloseTo(POSITION_EPSILON, 12)
    expect(route.holes).toHaveLength(1)
    const oneEnd = calculate({ startOffset: -1000 }).routes[0]
    expect(oneEnd.boundingRect.width.toNumber()).toBeCloseTo(POSITION_EPSILON, 12)
  })

  it('reverses sharp turns while keeping the corner and side hole orientations', () => {
    const value = { right: true, topRightCorner: true }
    const forward = calculate(value).routes[0]
    const reverse = calculate({ ...value, stitchDirection: 'end-to-start' }).routes[0]
    expect(centers(forward.holes)).toEqual([
      [0, 0],
      [30, 0],
      [60, 0],
      [100, 0],
      [100, 30],
      [100, 60],
    ])
    expect(centers(reverse.holes)).toEqual([
      [100, 80],
      [100, 50],
      [100, 20],
      [100, 0],
      [70, 0],
      [40, 0],
      [10, 0],
    ])
    for (const route of [forward, reverse]) {
      for (const hole of route.holes) {
        expect(hole.rotation % 180).toBe(hole.center.x.eq(100) ? 0 : 90)
      }
    }
    expect(getPointDistance(reverse.holes[3].center, reverse.holes[4].center).toNumber()).toBe(30)
    expect(forward.holes[0].rotation).toBe(270)
    expect(reverse.holes[reverse.holes.length - 1].rotation).toBe(90)
    expect(forward.stitches).toHaveLength(forward.holes.length - 1)
    expect(reverse.stitches).toHaveLength(reverse.holes.length - 1)
  })

  it('continues reversed punching across a rounded corner after leaving a sharp corner', () => {
    const route = calculate({
      right: true,
      left: true,
      topRightCorner: true,
      topLeftCorner: true,
      individualRadii: true,
      topLeftRadius: 20,
      stitchDirection: 'end-to-start',
      stitchHoleDistance: 15,
    }).routes[0]
    const cornerIndex = route.holes.findIndex((hole) => hole.center.x.eq(100) && hole.center.y.isZero())
    expect(cornerIndex).toBeGreaterThan(0)
    expect(route.holes[cornerIndex].rotation % 180).toBe(0)
    expect(centers(route.holes)[cornerIndex + 1]).toEqual([85, 0])
    expect(
      route.holes.some(
        (hole) => hole.center.x.gt(0) && hole.center.x.lt(20) && hole.center.y.gt(0) && hole.center.y.lt(20),
      ),
    ).toBe(true)
    for (let index = cornerIndex + 1; index < route.holes.length; index += 1) {
      expect(getPointDistance(route.holes[index - 1].center, route.holes[index].center).toNumber()).toBeCloseTo(15, 7)
    }
    for (let index = 1; index < route.holes.length; index += 1) {
      if (route.holes[index - 1].center.x.isZero() && route.holes[index].center.x.isZero()) {
        expect(route.holes[index].rotation % 180).toBe(0)
      }
    }
  })

  it('shifts a rounded closed loop start around the perimeter and ignores end offset', () => {
    const value = {
      top: true,
      right: true,
      bottom: true,
      left: true,
      topLeftCorner: true,
      topRightCorner: true,
      bottomLeftCorner: true,
      bottomRightCorner: true,
      topLeftRadius: 10,
      topRightRadius: 10,
      bottomLeftRadius: 10,
      bottomRightRadius: 10,
      stitchHoleDistance: 6,
    }
    for (const direction of ['start-to-end', 'end-to-start'] as const) {
      const route = calculate({ ...value, startOffset: 7, stitchDirection: direction }).routes[0]
      expect(route.isClosed).toBe(true)
      expect(centers(route.holes)[0]).toEqual([17, 0])
      expect(
        calculate({ ...value, startOffset: 7, endOffset: 999, stitchDirection: direction }).routes[0].holes,
      ).toEqual(route.holes)
      expect(
        getPointDistance(route.holes[0].center, route.holes[route.holes.length - 1].center).toNumber(),
      ).toBeGreaterThan(3)
      expect(route.stitches).toHaveLength(route.holes.length)
    }
    const perimeter = 280 + 20 * Math.PI
    const wrapped = calculate({ ...value, startOffset: perimeter + 7 }).routes[0]
    expect(wrapped.holes[0].center.x.toNumber()).toBeCloseTo(17, 9)
    const onArc = calculate({ ...value, startOffset: 85 }).routes[0]
    expect(onArc.holes[0].center.x.gt(90)).toBe(true)
    expect(onArc.holes[0].center.y.gt(0)).toBe(true)
    expect(calculate({ ...value, startOffset: -7 }).routes[0].holes[0].center.y.gt(0)).toBe(true)
  })

  it('ignores both offsets on a closed loop containing a sharp corner', () => {
    const value = {
      right: true,
      bottom: true,
      left: true,
      topLeftCorner: true,
      topRightCorner: true,
      bottomLeftCorner: true,
      bottomRightCorner: true,
    }
    expect(calculate({ ...value, startOffset: 20, endOffset: 30 })).toEqual(calculate(value))
    expect(centers(calculate(value).routes[0].holes)[0]).toEqual([0, 0])
    const reverse = calculate({ ...value, stitchDirection: 'end-to-start' }).routes[0]
    expect(centers(reverse.holes)[0]).toEqual([0, 0])
    expect(reverse.holes.filter((hole) => hole.center.x.eq(100) && hole.center.y.isZero())).toHaveLength(1)
  })

  it('repairs disconnected input before computing a single route', () => {
    expect(calculate({ bottom: true }).routes).toHaveLength(1)
  })
})
