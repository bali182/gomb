import BigNumber from 'bignumber.js'
import { describe, expect, it } from 'vitest'
import { POSITION_EPSILON, ZERO_CORNER_RADIUS } from '../../constants/layout'
import { defaultComponentBoundsStitchLine, defaultStitchingSettings } from '../../defaultStates'
import type { ComputedStitchHoleSchema, ComputedStitchLineSchema } from '../../schemas/computed'
import type { ResolvedComponentBoundsStitchLineSchema } from '../../schemas/stitching'
import { isDefined } from '../../utils/isDefined'
import { narrowers } from '../../utils/narrowers'
import { getPointDistance } from '../geometryUtils'
import { getPathSegments } from '../pathSegments'
import { getPathSegmentLength } from '../pathSegmentUtils'
import { calculateComponentBoundsStitchLine } from './calculateComponentBoundsStitchLine'
import type { ComponentBoundsStitchLineTarget } from './helperTypes'
import { getStitchPathFragmentsLength } from './stitchLineFragmentGeometry'

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

  it('extends a corner endpoint in its adjacent side direction without moving the corner', () => {
    const value = { topLeftCorner: true, topLeftRadius: 20, startOffset: 12 }
    const route = calculate(value).routes[0]
    expect(route.fragments[0]).toEqual({
      type: 'side',
      side: 'left',
      start: { x: new BigNumber(0), y: new BigNumber(32) },
      end: { x: new BigNumber(0), y: new BigNumber(20) },
    })
    expect(route.fragments.slice(1)).toEqual(calculate({ ...value, startOffset: 0 }).routes[0].fragments)
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

  it.each([
    {
      field: 'topRightCorner',
      startSide: 'top',
      endSide: 'right',
      start: (r: number): number[] => [93 - r, 0],
      end: (r: number): number[] => [100, r + 11],
    },
    {
      field: 'bottomRightCorner',
      startSide: 'right',
      endSide: 'bottom',
      start: (r: number): number[] => [100, 73 - r],
      end: (r: number): number[] => [89 - r, 80],
    },
    {
      field: 'bottomLeftCorner',
      startSide: 'bottom',
      endSide: 'left',
      start: (r: number): number[] => [r + 7, 80],
      end: (r: number): number[] => [0, 69 - r],
    },
    {
      field: 'topLeftCorner',
      startSide: 'left',
      endSide: 'top',
      start: (r: number): number[] => [0, r + 7],
      end: (r: number): number[] => [r + 11, 0],
    },
  ])(
    'extends both endpoints of $field straight along their adjoining sides',
    ({ field, startSide, endSide, start, end }) => {
      for (const radius of [0, 10]) {
        const route = calculate({
          top: false,
          [field]: true,
          topLeftRadius: radius,
          topRightRadius: radius,
          bottomLeftRadius: radius,
          bottomRightRadius: radius,
          startOffset: 7,
          endOffset: 11,
        }).routes[0]
        expect(route.fragments).toHaveLength(3)
        expect(route.fragments[0]).toMatchObject({ type: 'side', side: startSide })
        expect(route.fragments[2]).toMatchObject({ type: 'side', side: endSide })
        expect([route.fragments[0].start.x.toNumber(), route.fragments[0].start.y.toNumber()]).toEqual(start(radius))
        expect([route.fragments[2].end.x.toNumber(), route.fragments[2].end.y.toNumber()]).toEqual(end(radius))
        expect(getStitchPathFragmentsLength(route.fragments).toNumber()).toBeCloseTo(18 + (radius * Math.PI) / 2, 10)
        expect(route.isClosed).toBe(false)
      }
    },
  )

  it('crosses a sharp corner when trimming, retaining it only when the cut ends on it', () => {
    const value = { right: true, topRightCorner: true }
    const onCorner = calculate({ ...value, startOffset: -100 }).routes[0]
    expect(onCorner.fragments[0]).toMatchObject({ type: 'corner', corner: 'top-right', radius: new BigNumber(0) })
    expect(centers(onCorner.holes)[0]).toEqual([100, 0])
    expect(onCorner.holes[0].rotation % 180).toBe(0)
    const afterCorner = calculate({ ...value, startOffset: -110 }).routes[0]
    expect(afterCorner.fragments).toHaveLength(1)
    expect(afterCorner.fragments[0]).toMatchObject({ type: 'side', side: 'right' })
    expect(centers(afterCorner.holes)[0]).toEqual([100, 10])
    expect(afterCorner.labelPosition).toBe('right')
    const fromEnd = calculate({ ...value, endOffset: -90 }).routes[0]
    expect(fromEnd.fragments).toHaveLength(1)
    expect(fromEnd.fragments[0]).toMatchObject({ type: 'side', side: 'top' })
    expect(fromEnd.fragments[0].end.x.toNumber()).toBe(90)
    const endingOnCorner = calculate({ ...value, endOffset: -80 }).routes[0]
    const lastHole = endingOnCorner.holes[endingOnCorner.holes.length - 1]
    expect([lastHole.center.x.toNumber(), lastHole.center.y.toNumber()]).toEqual([100, 0])
    expect(lastHole.rotation % 180).toBe(0)
  })

  it('measures trimming into and through a rounded corner along the arc', () => {
    const value = { right: true, topRightCorner: true, topRightRadius: 10, startOffset: -95, stitchHoleDistance: 5 }
    const route = calculate(value).routes[0]
    const cornerFragment = route.fragments.find(narrowers.path.is.cornerFragment)
    if (!isDefined(cornerFragment)) {
      throw new Error('Expected a partially trimmed corner')
    }
    expect(route.fragments[0]).toBe(cornerFragment)
    expect(cornerFragment.center).toEqual({ x: new BigNumber(90), y: new BigNumber(10) })
    expect(cornerFragment.radius.toNumber()).toBe(10)
    expect(cornerFragment.start.x.toNumber()).toBeCloseTo(90 + 10 * Math.sin(0.5), 10)
    expect(cornerFragment.start.y.toNumber()).toBeCloseTo(10 - 10 * Math.cos(0.5), 10)
    expect(getStitchPathFragmentsLength(route.fragments).toNumber()).toBeCloseTo(70 + 5 * Math.PI - 5, 10)
    for (const result of [route, calculate({ ...value, stitchDirection: 'end-to-start' }).routes[0]]) {
      for (let index = 1; index < result.holes.length; index += 1) {
        expect(getPointDistance(result.holes[index - 1].center, result.holes[index].center).toNumber()).toBeCloseTo(
          5,
          7,
        )
      }
    }
    const pastCorner = calculate({ ...value, startOffset: -(90 + 5 * Math.PI + 7) }).routes[0]
    expect(pastCorner.fragments).toHaveLength(1)
    expect(pastCorner.fragments[0]).toMatchObject({ type: 'side', side: 'right' })
    expect(pastCorner.fragments[0].start.y.toNumber()).toBeCloseTo(17, 10)
    const startingWithCorner = calculate({ topLeftCorner: true, topLeftRadius: 20, startOffset: -(10 * Math.PI + 15) })
      .routes[0]
    expect(startingWithCorner.fragments).toHaveLength(1)
    expect(startingWithCorner.fragments[0].start.x.toNumber()).toBeCloseTo(35, 10)
  })

  it('trims both ends of one arc without shrinking or moving its circle', () => {
    const route = calculate({ top: false, topRightCorner: true, topRightRadius: 10, startOffset: -3, endOffset: -4 })
      .routes[0]
    expect(route.fragments).toHaveLength(1)
    expect(route.fragments[0]).toMatchObject({
      type: 'corner',
      radius: new BigNumber(10),
      center: { x: new BigNumber(90), y: new BigNumber(10) },
    })
    expect(getStitchPathFragmentsLength(route.fragments).toNumber()).toBeCloseTo(5 * Math.PI - 7, 10)
    const [arc] = getPathSegments(route.path)
    expect(getPathSegmentLength(arc).toNumber()).toBeCloseTo(5 * Math.PI - 7, 8)
  })

  it('can consume the original geometry and leave only the opposite extension', () => {
    const route = calculate({ startOffset: -120, endOffset: 30 }).routes[0]
    expect(route.fragments).toHaveLength(1)
    expect(route.fragments[0].start.x.toNumber()).toBeCloseTo(120, 10)
    expect(route.fragments[0].end.x.toNumber()).toBe(130)
    expect(getStitchPathFragmentsLength(route.fragments).toNumber()).toBeCloseTo(10, 10)
    const clamped = calculate({ startOffset: -1000, endOffset: 30 }).routes[0]
    expect(getStitchPathFragmentsLength(clamped.fragments).toNumber()).toBeCloseTo(POSITION_EPSILON, 12)
    const fromSharp = calculate({ top: false, topRightCorner: true, startOffset: -1000, endOffset: 20 }).routes[0]
    expect(fromSharp.fragments).toHaveLength(1)
    expect(fromSharp.fragments[0]).toMatchObject({ type: 'side', side: 'right' })
    expect(getStitchPathFragmentsLength(fromSharp.fragments).toNumber()).toBeCloseTo(POSITION_EPSILON, 12)
  })

  it('retains a parseable epsilon-length arc when both offsets overconsume it', () => {
    for (const radius of [1, 10, 30]) {
      const value = { top: false, topRightCorner: true, topRightRadius: radius, startOffset: -1000, endOffset: -1000 }
      for (const direction of ['start-to-end', 'end-to-start'] as const) {
        const route = calculate({ ...value, stitchDirection: direction }).routes[0]
        const length = getStitchPathFragmentsLength(route.fragments)
        expect(length.gt(0)).toBe(true)
        expect(length.toNumber()).toBeCloseTo(POSITION_EPSILON, 11)
        expect(route.holes).toHaveLength(1)
        const segments = getPathSegments(route.path)
        expect(segments).toHaveLength(1)
        expect(getPathSegmentLength(segments[0]).toNumber()).toBeCloseTo(POSITION_EPSILON, 10)
      }
    }
  })

  it('leaves an unextended sharp corner empty and never invents a route for an empty boundary', () => {
    expect(calculate({ top: false, topRightCorner: true, startOffset: -20, endOffset: -30 }).routes).toEqual([])
    expect(calculate({ top: false, startOffset: 20, endOffset: 30 }).routes).toEqual([])
  })

  it('labels actual remaining geometry even when both extensions share an otherwise disabled side', () => {
    const route = calculate({
      top: false,
      right: true,
      bottom: true,
      left: true,
      topLeftCorner: true,
      topRightCorner: true,
      bottomLeftCorner: true,
      bottomRightCorner: true,
      startOffset: 7,
      endOffset: 11,
    }).routes[0]
    expect(route.fragments.filter(narrowers.path.is.sideFragment)).toHaveLength(5)
    expect(route.labelPosition).toBe('top')
  })
})
