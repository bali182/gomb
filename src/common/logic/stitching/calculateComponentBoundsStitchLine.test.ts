import BigNumber from 'bignumber.js'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { POSITION_EPSILON, ZERO_CORNER_RADIUS } from '../../constants/layout'
import { defaultComponentBoundsStitchLine, defaultStitchingSettings } from '../../defaultStates'
import type { ComputedStitchHoleSchema, ComputedStitchLineSchema } from '../../schemas/computed'
import type { ResolvedComponentBoundsStitchLineSchema } from '../../schemas/stitching'
import { isDefined } from '../../utils/isDefined'
import { narrowers } from '../../utils/narrowers'
import { getPointDistance } from '../geometryUtils'
import { getPathSegments } from '../pathSegments'
import { getPathSegmentLength } from '../pathSegmentUtils'
import {
  adjustStitchLineHoleRotations,
  CLOSED_STITCH_HOLE_DISTANCE_TOLERANCE_MM,
} from './adjustStitchLineHoleRotations'
import { calculateComponentBoundsStitchLine } from './calculateComponentBoundsStitchLine'
import { getStitchHoleLine } from './getStitchHoleLine'
import type { ComponentBoundsStitchLineTarget } from './helperTypes'
import { getStitchPathFragmentsLength } from './stitchLineFragmentGeometry'

const { featureFlags } = vi.hoisted(() => ({ featureFlags: { roundedStitchHoleRotationAdjustment: true } }))
vi.mock('../../featureFlags', () => ({ featureFlags }))
vi.mock('./adjustStitchLineHoleRotations', { spy: true })

beforeEach(() => {
  featureFlags.roundedStitchHoleRotationAdjustment = true
  vi.mocked(adjustStitchLineHoleRotations).mockClear()
})

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
  it.each(['start-to-end', 'end-to-start'] as const)(
    'only adjusts hole angles when the feature is enabled: %s',
    (stitchDirection) => {
      const value = {
        right: true,
        topRightCorner: true,
        topRightRadius: 20,
        stitchHoleDistance: 7,
        stitchHoleLength: 2,
        stitchDirection,
      }
      const adjusted = calculate(value).routes[0]
      expect(adjustStitchLineHoleRotations).toHaveBeenCalledTimes(1)
      vi.mocked(adjustStitchLineHoleRotations).mockClear()
      featureFlags.roundedStitchHoleRotationAdjustment = false
      const unadjusted = calculate(value).routes[0]
      const tangents = calculate({ ...value, stitchHoleLength: 0 }).routes[0]
      expect(adjustStitchLineHoleRotations).not.toHaveBeenCalled()
      expect(unadjusted.holes.map(({ rotation }) => rotation)).toEqual(tangents.holes.map(({ rotation }) => rotation))
      const { holes: adjustedHoles, stitches: adjustedStitches, ...adjustedGeometry } = adjusted
      const { holes: unadjustedHoles, stitches: unadjustedStitches, ...unadjustedGeometry } = unadjusted
      expect(adjustedGeometry).toEqual(unadjustedGeometry)
      expect(centers(adjustedHoles)).toEqual(centers(unadjustedHoles))
      expect(adjustedHoles.some((hole, index) => hole.rotation !== unadjustedHoles[index].rotation)).toBe(true)
      expect(adjustedStitches).toHaveLength(unadjustedStitches.length)
      for (let index = 0; index < adjustedHoles.length; index += 1) {
        expect(Object.keys(adjustedHoles[index]).sort()).toEqual(['center', 'line', 'rotation'])
        expect(Object.keys(unadjustedHoles[index]).sort()).toEqual(['center', 'line', 'rotation'])
        expect(getPointDistance(adjustedHoles[index].line.start, adjustedHoles[index].line.end).toNumber()).toBeCloseTo(
          getPointDistance(unadjustedHoles[index].line.start, unadjustedHoles[index].line.end).toNumber(),
          10,
        )
      }
    },
  )

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

  it('keeps the initial tangent orientations at shared arc points when no hole length needs correction', () => {
    const value = {
      top: false,
      topLeftCorner: true,
      topLeftRadius: 20,
      stitchHoleDistance: Math.sqrt(800),
      stitchHoleLength: 0,
    }
    const forward = calculate(value).routes[0]
    const reverse = calculate({ ...value, stitchDirection: 'end-to-start' }).routes[0]
    expect(forward.holes).toHaveLength(2)
    expect(reverse.holes).toHaveLength(2)
    for (let index = 0; index < forward.holes.length; index += 1) {
      const forwardHole = forward.holes[index]
      const reverseHole = reverse.holes[reverse.holes.length - 1 - index]
      expect(getPointDistance(forwardHole.center, reverseHole.center).toNumber()).toBeCloseTo(0, 9)
      expect((reverseHole.rotation - forwardHole.rotation + 360) % 360).toBeCloseTo(180, 9)
      expect(getPointDistance(forwardHole.line.start, reverseHole.line.end).toNumber()).toBeCloseTo(0, 9)
      expect(getPointDistance(forwardHole.line.end, reverseHole.line.start).toNumber()).toBeCloseTo(0, 9)
    }
  })

  it.each([false, true])('retains local tangent orientations for zero-length holes with closed=%s', (closed) => {
    for (const direction of ['start-to-end', 'end-to-start'] as const) {
      const route = calculate({
        right: true,
        bottom: true,
        left: closed,
        topLeftCorner: closed,
        topRightCorner: true,
        bottomRightCorner: true,
        bottomLeftCorner: closed,
        topLeftRadius: 20,
        topRightRadius: 20,
        bottomRightRadius: 20,
        bottomLeftRadius: 20,
        stitchHoleDistance: 7,
        stitchHoleLength: 0,
        stitchDirection: direction,
      }).routes[0]
      expect(route.isClosed).toBe(closed)
      expect(route.holes.length).toBeGreaterThan(20)
      for (const hole of route.holes) {
        const x = hole.center.x.toNumber()
        const y = hole.center.y.toNumber()
        const radialX = x - Math.max(20, Math.min(80, x))
        const radialY = y - Math.max(20, Math.min(60, y))
        const radialAngle = (Math.atan2(radialY, radialX) * 180) / Math.PI
        const expectedRotation = (radialAngle + (direction === 'end-to-start' ? 180 : 0) + 360) % 360
        const difference = ((hole.rotation - expectedRotation + 540) % 360) - 180
        expect(difference).toBeCloseTo(0, 9)
      }
    }
  })

  it.each([
    { name: 'standalone arc', top: false, right: false, bottom: false, closed: false, startOffset: 0 },
    { name: 'trimmed arc', top: false, right: false, bottom: false, closed: false, startOffset: -5 },
    { name: 'side-arc-side', top: true, right: true, bottom: true, closed: false, startOffset: 0 },
    { name: 'closed from a side', top: true, right: true, bottom: true, closed: true, startOffset: 7 },
    { name: 'closed from an arc', top: true, right: true, bottom: true, closed: true, startOffset: 65 },
  ])('corrects rounded hole angles without changing the layout: $name', (testCase) => {
    const distance = 7
    const length = 2
    const firstStraight = getStitchHoleLine({ x: new BigNumber(0), y: new BigNumber(0) }, 270, length)
    const secondStraight = getStitchHoleLine({ x: new BigNumber(distance), y: new BigNumber(0) }, 270, length)
    const targetLength = getPointDistance(firstStraight.end, secondStraight.start).toNumber()
    for (const direction of ['start-to-end', 'end-to-start'] as const) {
      const value: Partial<ResolvedComponentBoundsStitchLineSchema> = {
        top: testCase.top,
        right: testCase.right,
        bottom: testCase.bottom,
        left: testCase.closed,
        topLeftCorner: testCase.closed,
        topRightCorner: true,
        bottomRightCorner: testCase.bottom,
        bottomLeftCorner: testCase.closed,
        topLeftRadius: 20,
        topRightRadius: 20,
        bottomRightRadius: 20,
        bottomLeftRadius: 20,
        stitchHoleDistance: distance,
        startOffset: testCase.startOffset,
        stitchDirection: direction,
      }
      const initial = calculate({ ...value, stitchHoleLength: 0 }).routes[0]
      const route = calculate({ ...value, stitchHoleLength: length }).routes[0]
      expect(centers(route.holes)).toEqual(centers(initial.holes))
      expect(route.fragments).toEqual(initial.fragments)
      expect(route.isClosed).toBe(testCase.closed)
      expect(route.stitches).toHaveLength(route.holes.length - (route.isClosed ? 0 : 1))
      const lastIndex = route.holes.length - 1
      const preserveClosingStitch =
        route.isClosed &&
        getPointDistance(route.holes[lastIndex].center, route.holes[0].center)
          .minus(distance)
          .abs()
          .gt(CLOSED_STITCH_HOLE_DISTANCE_TOLERANCE_MM)
      let correctedCount = 0
      for (let index = 0; index < route.holes.length; index += 1) {
        const hole = route.holes[index]
        expect(getPointDistance(hole.line.start, hole.line.end).toNumber()).toBeCloseTo(length, 10)
        const x = hole.center.x.toNumber()
        const y = hole.center.y.toNumber()
        const onArc = x > 0 && x < 100 && y > 0 && y < 80
        if (!onArc || index === 0 || (preserveClosingStitch && index === lastIndex)) {
          expect(hole.rotation).toBe(initial.holes[index].rotation)
          continue
        }
        const previous = route.holes[index - 1]
        const centerDistance = getPointDistance(previous.line.end, hole.center).toNumber()
        const minimumLength = Math.abs(centerDistance - length / 2)
        const maximumLength = centerDistance + length / 2
        const expectedLength = Math.max(minimumLength, Math.min(maximumLength, targetLength))
        expect(getPointDistance(previous.line.end, hole.line.start).toNumber()).toBeCloseTo(expectedLength, 9)
        if (Math.abs(hole.rotation - initial.holes[index].rotation) > 1e-9) {
          correctedCount += 1
        }
      }
      expect(correctedCount).toBeGreaterThan(0)
      if (preserveClosingStitch) {
        const firstOriginalLine = getStitchHoleLine(initial.holes[0].center, initial.holes[0].rotation, length)
        const lastOriginalLine = getStitchHoleLine(
          initial.holes[lastIndex].center,
          initial.holes[lastIndex].rotation,
          length,
        )
        expect(route.stitches[lastIndex].line).toEqual({ start: lastOriginalLine.end, end: firstOriginalLine.start })
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
