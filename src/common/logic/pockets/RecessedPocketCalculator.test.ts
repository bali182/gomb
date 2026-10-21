import BigNumber from 'bignumber.js'
import { describe, expect, it } from 'vitest'

import { ZERO_CORNER_RADIUS } from '../../constants/layout'
import type { PocketOrientationSchema, RecessedPocketOpeningSchema } from '../../schemas/components'
import type { PathSchema, PointSchema, RectSchema } from '../../schemas/geometry'
import { d } from '../../testData'
import { getPathSegments } from '../pathSegments'
import type { ArcPathSegment, PathSegment } from '../pathSegmentTypes'
import { getPathSegmentTangent, getPointOnPathSegment } from '../pathSegmentUtils'
import { RecessedPocketCalculator } from './RecessedPocketCalculator'

const rect: RectSchema = {
  x: new BigNumber(0),
  y: new BigNumber(0),
  width: new BigNumber(100),
  height: new BigNumber(100),
}

const createOpening = (overrides: Partial<RecessedPocketOpeningSchema> = {}): RecessedPocketOpeningSchema => ({
  id: 'own:test',
  name: 'Test',
  type: 'recessed',
  outerInset: 29,
  innerOffset: 15,
  depth: 8,
  outerRadius: 5,
  innerRadius: 5,
  ...overrides,
})

const createOpeningPath = (
  opening: RecessedPocketOpeningSchema,
  pocketRect: RectSchema,
  orientation: PocketOrientationSchema,
): PathSchema =>
  new RecessedPocketCalculator(
    d.pocketCluster({ id: 'cluster', orientation }),
    opening,
    pocketRect,
    ZERO_CORNER_RADIUS,
  ).getPocketOpeningPath()

const getArcs = (path: PathSchema): ArcPathSegment[] =>
  getPathSegments(path).filter((segment: PathSegment): segment is ArcPathSegment => segment.type === 'arc')

const expectPoint = (point: PointSchema, x: number, y: number): void => {
  expect(point.x.toNumber()).toBeCloseTo(x, 8)
  expect(point.y.toNumber()).toBeCloseTo(y, 8)
}

const expectSmoothJoins = (path: PathSchema): void => {
  const segments = getPathSegments(path)
  for (let index = 1; index < segments.length; index += 1) {
    const previous = segments[index - 1]
    const current = segments[index]
    const incoming = getPathSegmentTangent(previous, previous.end)
    const outgoing = getPathSegmentTangent(current, current.start)
    const incomingLength = incoming.x.pow(2).plus(incoming.y.pow(2)).sqrt()
    const outgoingLength = outgoing.x.pow(2).plus(outgoing.y.pow(2)).sqrt()
    const normalizedCross = incoming.x
      .times(outgoing.y)
      .minus(incoming.y.times(outgoing.x))
      .dividedBy(incomingLength.times(outgoingLength))
    const normalizedDot = incoming.x
      .times(outgoing.x)
      .plus(incoming.y.times(outgoing.y))
      .dividedBy(incomingLength.times(outgoingLength))

    expectPoint(current.start, previous.end.x.toNumber(), previous.end.y.toNumber())
    expect(normalizedCross.toNumber()).toBeCloseTo(0, 8)
    expect(normalizedDot.toNumber()).toBeCloseTo(1, 8)
  }
}

describe('RecessedPocketCalculator', () => {
  it('keeps the illustrated R15 inner circle and joins it tangentially to R5 outer circles', () => {
    const opening = createOpening({ outerInset: 35, depth: 15, outerRadius: 5, innerRadius: 15 })
    const path = createOpeningPath(opening, rect, 'up')
    const arcs = getArcs(path)
    const outerStart = 50 - 5 * Math.sqrt(15)
    const tangentX = 50 - (15 * Math.sqrt(15)) / 4

    expect(arcs.map((arc) => arc.radius.toNumber())).toEqual([5, 15, 15, 5])
    expectPoint(arcs[0].center, outerStart, 5)
    expectPoint(arcs[0].start, outerStart, 0)
    expectPoint(arcs[0].end, tangentX, 3.75)
    expectPoint(arcs[1].center, 50, 0)
    expectPoint(arcs[1].end, 50, 15)
    expectPoint(arcs[2].center, 50, 0)
    expectPoint(arcs[3].center, 100 - outerStart, 5)
    expect(Math.abs(arcs[1].sweepAngle)).toBeLessThan(Math.PI / 2)
    expectSmoothJoins(path)
    expect(opening).toEqual(createOpening({ outerInset: 35, depth: 15, outerRadius: 5, innerRadius: 15 }))
  })

  it.each([
    { outerRadius: 5, expectedSlopes: 2 },
    { outerRadius: 14.999999, expectedSlopes: 2 },
    { outerRadius: 15, expectedSlopes: 0 },
    { outerRadius: 15.000001, expectedSlopes: 0 },
    { outerRadius: 30, expectedSlopes: 0 },
  ])('joins R$outerRadius and R5 with $expectedSlopes sloping straight segments', ({ outerRadius, expectedSlopes }) => {
    const path = createOpeningPath(createOpening({ outerRadius }), rect, 'up')
    const slopes = getPathSegments(path).filter(
      (segment) => segment.type === 'line' && !segment.start.y.isEqualTo(segment.end.y),
    )

    expect(slopes).toHaveLength(expectedSlopes)
    expect(getArcs(path).map((arc) => arc.radius.toNumber())).toEqual([outerRadius, 5, 5, outerRadius])
    expectSmoothJoins(path)
  })

  it.each([14.999999, 15, 15.000001])(
    'changes continuously around the point where the straight disappears: R%s',
    (outerRadius) => {
      const arcs = getArcs(createOpeningPath(createOpening({ outerRadius }), rect, 'up'))

      const tolerance = Math.abs(outerRadius - 15) + 1e-12
      for (const [point, x, y] of [
        [arcs[0].start, 21.5, 0],
        [arcs[0].end, 33.5, 6],
        [arcs[1].start, 33.5, 6],
      ] as const) {
        expect(point.x.minus(x).abs().toNumber()).toBeLessThanOrEqual(tolerance)
        expect(point.y.minus(y).abs().toNumber()).toBeLessThanOrEqual(tolerance)
      }
      expectPoint(arcs[1].center, 37.5, 3)
      expectPoint(arcs[1].end, 37.5, 8)
    },
  )

  it.each([0, 1, 5, 15, 20, 40])('keeps the inner circles unchanged when the outer radius is %s', (outerRadius) => {
    const path = createOpeningPath(createOpening({ outerRadius }), rect, 'up')
    const innerArcs = getArcs(path).filter((arc) => arc.reversed)

    expect(innerArcs).toHaveLength(2)
    expect(innerArcs.map((arc) => arc.radius.toNumber())).toEqual([5, 5])
    expectPoint(innerArcs[0].center, 37.5, 3)
    expectPoint(innerArcs[1].center, 62.5, 3)
    if (outerRadius > 0) {
      expectSmoothJoins(path)
    }
  })

  it.each([
    { outerInset: 15, innerOffset: 15, depth: 10, outerRadius: 5, innerRadius: 5 },
    { outerInset: 20, innerOffset: 15, depth: 2, outerRadius: 100, innerRadius: 50 },
    { outerInset: 35, innerOffset: 15, depth: 2, outerRadius: 100, innerRadius: 15 },
    { outerInset: 25, innerOffset: 15, depth: 30, outerRadius: 5, innerRadius: 5 },
  ])('keeps shallow and steep transitions smooth: %o', (parameters) => {
    const path = createOpeningPath(createOpening(parameters), rect, 'up')
    expect(getArcs(path).map((arc) => arc.radius.toNumber())).toEqual([
      parameters.outerRadius,
      parameters.innerRadius,
      parameters.innerRadius,
      parameters.outerRadius,
    ])
    expectSmoothJoins(path)
  })

  it.each([5, 15, 30])('mirrors the whole path when the outer radius is %s', (outerRadius) => {
    const segments = getPathSegments(createOpeningPath(createOpening({ outerRadius }), rect, 'up'))
    for (let index = 0; index < segments.length; index += 1) {
      for (const progress of [0, 0.25, 0.5, 0.75, 1]) {
        const first = getPointOnPathSegment(segments[index], new BigNumber(progress))
        const mirrored = getPointOnPathSegment(segments[segments.length - 1 - index], new BigNumber(1 - progress))
        expectPoint(mirrored, 100 - first.x.toNumber(), first.y.toNumber())
      }
    }
  })

  it.each([
    { outerRadius: 0, innerRadius: 0, expectedRadii: [] },
    { outerRadius: 0, innerRadius: 5, expectedRadii: [5, 5] },
    { outerRadius: 5, innerRadius: 0, expectedRadii: [5, 5] },
    { outerRadius: 0, innerRadius: 15, expectedRadii: [15, 15] },
    { outerRadius: 20, innerRadius: 0, expectedRadii: [20, 20] },
  ])('omits zero-radius arcs: %o', ({ outerRadius, innerRadius, expectedRadii }) => {
    const path = createOpeningPath(createOpening({ outerInset: 35, depth: 15, outerRadius, innerRadius }), rect, 'up')
    expect(getArcs(path).map((arc) => arc.radius.toNumber())).toEqual(expectedRadii)
    for (const segment of getPathSegments(path)) {
      expect(segment.start.x.isFinite() && segment.start.y.isFinite()).toBe(true)
      expect(segment.end.x.isFinite() && segment.end.y.isFinite()).toBe(true)
    }
  })

  it('uses two R15 quarter arcs for an unrounded U opening', () => {
    const path = createOpeningPath(
      createOpening({ outerInset: 35, depth: 15, outerRadius: 0, innerRadius: 15 }),
      rect,
      'up',
    )
    const arcs = getArcs(path)
    expectPoint(arcs[0].start, 35, 0)
    expectPoint(arcs[0].center, 50, 0)
    expectPoint(arcs[0].end, 50, 15)
    expectPoint(arcs[1].end, 65, 0)
    expect(Math.abs(arcs[0].sweepAngle)).toBeCloseTo(Math.PI / 2, 8)
    expect(Math.abs(arcs[1].sweepAngle)).toBeCloseTo(Math.PI / 2, 8)
  })

  it('returns a straight opening at zero depth', () => {
    const segments = getPathSegments(createOpeningPath(createOpening({ depth: 0 }), rect, 'up'))
    expect(segments).toHaveLength(1)
    expect(segments[0].type).toBe('line')
    expectPoint(segments[0].start, 0, 0)
    expectPoint(segments[0].end, 100, 0)
  })
})

type OrientationTestCase = {
  orientation: PocketOrientationSchema
  width: number
  height: number
  start: [number, number]
  end: [number, number]
  bottom: [number, number]
  innerCenter: [number, number]
}

describe.each<OrientationTestCase>([
  {
    orientation: 'up',
    width: 100,
    height: 60,
    start: [11, 17],
    end: [111, 17],
    bottom: [61, 32],
    innerCenter: [61, 17],
  },
  {
    orientation: 'right',
    width: 60,
    height: 100,
    start: [71, 17],
    end: [71, 117],
    bottom: [56, 67],
    innerCenter: [71, 67],
  },
  {
    orientation: 'down',
    width: 100,
    height: 60,
    start: [111, 77],
    end: [11, 77],
    bottom: [61, 62],
    innerCenter: [61, 77],
  },
  {
    orientation: 'left',
    width: 60,
    height: 100,
    start: [11, 117],
    end: [11, 17],
    bottom: [26, 67],
    innerCenter: [11, 67],
  },
])('recessed opening facing $orientation', ({ orientation, width, height, start, end, bottom, innerCenter }) => {
  it('rotates and translates the opening without changing its radii or joins', () => {
    const calculator = new RecessedPocketCalculator(
      d.pocketCluster({ id: 'cluster', orientation }),
      createOpening({ outerInset: 35, depth: 15, outerRadius: 5, innerRadius: 15 }),
      { x: new BigNumber(11), y: new BigNumber(17), width: new BigNumber(width), height: new BigNumber(height) },
      ZERO_CORNER_RADIUS,
    )
    const path: PathSchema = {
      commands: calculator.getFrontPocketPath().commands.slice(0, calculator.getPocketOpeningPath().commands.length),
    }
    const segments = getPathSegments(path)
    const arcs = getArcs(path)
    expectPoint(segments[0].start, ...start)
    expectPoint(segments[segments.length - 1].end, ...end)
    expectPoint(arcs[1].center, ...innerCenter)
    expectPoint(arcs[1].end, ...bottom)
    expectPoint(arcs[2].center, ...innerCenter)
    expect(arcs.map((arc) => arc.radius.toNumber())).toEqual([5, 15, 15, 5])
    expectSmoothJoins(path)
  })
})
