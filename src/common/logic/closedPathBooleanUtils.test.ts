import BigNumber from 'bignumber.js'
import { describe, expect, it } from 'vitest'
import { narrowers } from '../utils/narrowers'

import type { PathSchema } from '../schemas/geometry'
import type { RecessedPocketOpeningSchema } from '../schemas/pocketOpening'
import { d } from '../testData'
import { calculateRectPath } from './calculateRectPath'
import {
  intersectClosedPaths,
  isClosedPathCoveredBy,
  subtractClosedPaths,
  unionClosedPaths,
} from './closedPathBooleanUtils'
import { isPointInClosedPath } from './isPointInClosedPath'
import { getClosedPathLoops } from './pathSegments'
import { createPocketCalculator } from './pockets/createPocketCalculator'

type NearContactCase = {
  radius: number
  gap: number
  orientation: 'horizontal' | 'vertical'
  position: number
}

const rectangle = (x: number, y: number, width: number, height: number, radius = 0): PathSchema => {
  const corner = new BigNumber(radius)
  return calculateRectPath(
    { x: new BigNumber(x), y: new BigNumber(y), width: new BigNumber(width), height: new BigNumber(height) },
    { topLeft: corner, topRight: corner, bottomLeft: corner, bottomRight: corner },
  )
}

// Green's theorem measures the actual output, independently of the boolean implementation.
const getArea = (path: PathSchema): number => {
  return getClosedPathLoops(path)
    .flat()
    .reduce((area, segment) => {
      if (narrowers.path.is.lineSegment(segment)) {
        return area + segment.start.x.times(segment.end.y).minus(segment.end.x.times(segment.start.y)).toNumber() / 2
      }
      return (
        area +
        (segment.center.x
          .times(segment.end.y.minus(segment.start.y))
          .minus(segment.center.y.times(segment.end.x.minus(segment.start.x)))
          .toNumber() +
          segment.radius.pow(2).toNumber() * segment.sweepAngle) /
          2
      )
    }, 0)
}

// These occupancy checks deliberately use only straight output edges, without calling the geometry library.
const isInsideRectilinearPath = (path: PathSchema, x: number, y: number): boolean => {
  let winding = 0
  for (const segment of getClosedPathLoops(path).flat()) {
    expect(segment.type).toBe('line')
    const startX = segment.start.x.toNumber()
    const startY = segment.start.y.toNumber()
    const endX = segment.end.x.toNumber()
    const endY = segment.end.y.toNumber()
    const cross = (endX - startX) * (y - startY) - (x - startX) * (endY - startY)
    if (startY <= y && endY > y && cross > 0) {
      winding += 1
    } else if (startY > y && endY <= y && cross < 0) {
      winding -= 1
    }
  }
  return winding !== 0
}

const polygon = (points: readonly (readonly [number, number])[]): PathSchema => ({
  commands: [
    ...points.map(([x, y], index) => ({
      type: index === 0 ? ('moveTo' as const) : ('lineTo' as const),
      point: { x: new BigNumber(x), y: new BigNumber(y) },
    })),
    { type: 'close' },
  ],
})

describe('self-intersecting closed paths', () => {
  const enclosing = rectangle(-20, -20, 40, 40)

  it.each([false, true])('keeps both lobes of a zero-signed-area bow tie, reversed=%s', (reversed) => {
    const points: readonly (readonly [number, number])[] = [
      [0, 0],
      [10, 10],
      [0, 10],
      [10, 0],
    ]
    const crossing = polygon(reversed ? [...points].reverse() : points)
    const normalized = intersectClosedPaths(crossing, enclosing)

    expect(getClosedPathLoops(normalized)).toHaveLength(2)
    expect(getArea(normalized)).toBeCloseTo(50, 8)
    expect(isInsideRectilinearPath(normalized, 5, 2)).toBe(true)
    expect(isInsideRectilinearPath(normalized, 5, 8)).toBe(true)
    expect(isInsideRectilinearPath(normalized, 1, 5)).toBe(false)
    expect(getArea(subtractClosedPaths(crossing, [rectangle(0, 0, 10, 5)]))).toBeCloseTo(25, 8)
    expect(getArea(subtractClosedPaths(enclosing, [crossing]))).toBeCloseTo(1550, 8)
    expect(getArea(unionClosedPaths(crossing, [rectangle(0, 0, 10, 5)]))).toBeCloseTo(75, 8)
    expect(isClosedPathCoveredBy(crossing, enclosing)).toBe(true)
    expect(isClosedPathCoveredBy(crossing, rectangle(0, 0, 10, 5))).toBe(false)
  })

  it.each([false, true])('splits several crossings without changing non-zero fill, reversed=%s', (reversed) => {
    const points: readonly (readonly [number, number])[] = [
      [0, 0],
      [10, 10],
      [0, 10],
      [10, 0],
      [5, 12],
    ]
    const source = polygon(reversed ? [...points].reverse() : points)
    const normalized = intersectClosedPaths(source, enclosing)
    for (let x = 0.25; x < 10; x += 0.5) {
      for (let y = 0.125; y < 12; y += 0.5) {
        expect(isInsideRectilinearPath(normalized, x, y)).toBe(isInsideRectilinearPath(source, x, y))
      }
    }
  })

  it.each([false, true])('preserves self-touching loops and retraced edges, reversed=%s', (reversed) => {
    const points: readonly (readonly [number, number])[] = [
      [0, 0],
      [4, 0],
      [4, 4],
      [0, 4],
      [0, 0],
      [-4, 0],
      [-4, -4],
      [0, -4],
      [0, 0],
      [2, -2],
      [0, 0],
    ]
    const source = polygon(reversed ? [...points].reverse() : points)
    const normalized = intersectClosedPaths(source, enclosing)
    expect(getArea(normalized)).toBeCloseTo(32, 8)
    expect(isInsideRectilinearPath(normalized, 2, 2)).toBe(true)
    expect(isInsideRectilinearPath(normalized, -2, -2)).toBe(true)
    expect(isInsideRectilinearPath(normalized, 1, -1.5)).toBe(false)
  })

  it.each([false, true])('resolves partially overlapping edges using non-zero fill, opposite=%s', (opposite) => {
    const inner: readonly (readonly [number, number])[] = [
      [0, 0],
      [5, 0],
      [5, 5],
      [0, 5],
      [0, 0],
    ]
    const source = polygon([[0, 0], [10, 0], [10, 10], [0, 10], [0, 0], ...(opposite ? [...inner].reverse() : inner)])
    const normalized = intersectClosedPaths(source, enclosing)
    expect(getArea(normalized)).toBeCloseTo(opposite ? 75 : 100, 8)
    expect(isInsideRectilinearPath(normalized, 2, 2)).toBe(!opposite)
    expect(isInsideRectilinearPath(normalized, 7, 7)).toBe(true)
  })

  it('removes a retraced circular arc without filling the space next to it', () => {
    const point = (x: number, y: number) => ({ x: new BigNumber(x), y: new BigNumber(y) })
    const source: PathSchema = {
      commands: [
        ...polygon([
          [0, 0],
          [10, 0],
          [10, 10],
          [0, 10],
          [0, 0],
        ]).commands.slice(0, -1),
        { type: 'arcTo', radius: new BigNumber(5), reversed: false, point: point(10, 0) },
        { type: 'arcTo', radius: new BigNumber(5), reversed: true, point: point(0, 0) },
        { type: 'close' },
      ],
    }
    const normalized = intersectClosedPaths(source, enclosing)
    expect(getArea(normalized)).toBeCloseTo(100, 8)
    expect(isInsideRectilinearPath(normalized, 5, 5)).toBe(true)
    expect(isInsideRectilinearPath(normalized, 5, -2)).toBe(false)
  })

  it.each([
    { reversed: false, opposite: false },
    { reversed: false, opposite: true },
    { reversed: true, opposite: false },
    { reversed: true, opposite: true },
  ])(
    'retains intersecting circular arcs and their winding, reversed=$reversed opposite=$opposite',
    ({ reversed, opposite }) => {
      const point = (x: number, y: number) => ({ x: new BigNumber(x), y: new BigNumber(y) })
      const radius = new BigNumber(5)
      const source: PathSchema = {
        commands: [
          { type: 'moveTo', point: point(0, 4) },
          { type: 'arcTo', radius, reversed, point: point(-6, -4) },
          { type: 'arcTo', radius, reversed, point: point(0, 4) },
          { type: 'arcTo', radius, reversed: reversed !== opposite, point: point(6, -4) },
          { type: 'arcTo', radius, reversed: reversed !== opposite, point: point(0, 4) },
          { type: 'close' },
        ],
      }
      const normalized = intersectClosedPaths(source, enclosing)
      const overlap = 50 * Math.acos(0.6) - 24
      const area = 50 * Math.PI - overlap * (opposite ? 2 : 1)
      expect(getArea(normalized)).toBeCloseTo(area, 7)
      expect(getArea(unionClosedPaths(source, [rectangle(15, 15, 2, 2)]))).toBeCloseTo(area + 4, 7)
      expect(getArea(subtractClosedPaths(enclosing, [source]))).toBeCloseTo(1600 - area, 7)
      expect(isClosedPathCoveredBy(source, enclosing)).toBe(true)
      expect(isPointInClosedPath(point(0.1, 0.3), normalized)).toBe(!opposite)
      expect(isPointInClosedPath(point(-5, 0.3), normalized)).toBe(true)
      expect(isPointInClosedPath(point(5, 0.3), normalized)).toBe(true)
      for (const segment of getClosedPathLoops(normalized).flat()) {
        expect(segment.type).toBe('arc')
        if (narrowers.path.is.arcSegment(segment)) {
          expect(segment.radius.toNumber()).toBeCloseTo(5, 8)
        }
      }
    },
  )
})

describe('closed path boolean operations', () => {
  it.each([34.999999, 34.9999999, 35, 35.0000001, 35.000001])(
    'exports short arc fragments after splitting at x=%s',
    (x) => {
      const circle = rectangle(20, 20, 30, 30, 15)
      const strip = rectangle(x, 0, 30, 70)
      const offset = x - 35
      const leftArea = (Math.PI * 225) / 2 + offset * Math.sqrt(225 - offset ** 2) + 225 * Math.asin(offset / 15)
      const rightArea = Math.PI * 225 - leftArea

      expect(getArea(unionClosedPaths(circle, [strip]))).toBeCloseTo(2100 + leftArea, 7)
      expect(getArea(unionClosedPaths(strip, [circle]))).toBeCloseTo(2100 + leftArea, 7)
      expect(getArea(intersectClosedPaths(circle, strip))).toBeCloseTo(rightArea, 7)
      expect(getArea(subtractClosedPaths(circle, [strip]))).toBeCloseTo(leftArea, 7)
      expect(getArea(subtractClosedPaths(strip, [circle]))).toBeCloseTo(2100 - rightArea, 7)
    },
  )

  it.each([1, 5, 15].flatMap((outerRadius) => [5, 10].map((shift) => ({ outerRadius, shift }))))(
    'unites pockets sharing an R15 arc with outer R$outerRadius and shift $shift',
    ({ outerRadius, shift }) => {
      const corner = new BigNumber(0)
      const corners = { topLeft: corner, topRight: corner, bottomLeft: corner, bottomRight: corner }
      const opening: RecessedPocketOpeningSchema = {
        id: 'opening',
        name: 'Opening',
        type: 'recessed',
        outerInset: 35,
        innerOffset: 15,
        depth: 15,
        outerRadius,
        innerRadius: 15,
      }
      const cluster = d.pocketCluster({ id: 'cluster', orientation: 'up' })
      const first = createPocketCalculator(
        d.frontPocket({ id: 'front' }),
        cluster,
        opening,
        { x: corner, y: corner, width: new BigNumber(100), height: new BigNumber(100) },
        corners,
      ).getFrontPocketPath()
      const second = createPocketCalculator(
        d.frontPocket({ id: 'front' }),
        cluster,
        { ...opening, depth: 15 - shift },
        { x: corner, y: new BigNumber(shift), width: new BigNumber(100), height: new BigNumber(100 - shift) },
        corners,
      ).getFrontPocketPath()

      expect(getArea(unionClosedPaths(first, [second]))).toBeCloseTo(getArea(first), 7)
      expect(getArea(unionClosedPaths(second, [first]))).toBeCloseTo(getArea(first), 7)
    },
  )

  it('unites overlapping rectangles and keeps disconnected islands', () => {
    const result = unionClosedPaths(rectangle(0, 0, 10, 10), [rectangle(5, 0, 10, 10), rectangle(30, 0, 10, 10)])
    expect(getArea(result)).toBeCloseTo(250, 8)
    expect(isInsideRectilinearPath(result, 7, 5)).toBe(true)
    expect(isInsideRectilinearPath(result, 20, 5)).toBe(false)
    expect(isInsideRectilinearPath(result, 35, 5)).toBe(true)
  })

  it('subtracts overlapping holes without restoring an earlier hole', () => {
    const result = subtractClosedPaths(rectangle(0, 0, 10, 10), [rectangle(2, 2, 4, 4), rectangle(4, 4, 4, 4)])
    expect(getArea(result)).toBeCloseTo(72, 8)
    expect(isInsideRectilinearPath(result, 3, 3)).toBe(false)
    expect(isInsideRectilinearPath(result, 5, 5)).toBe(false)
    expect(isInsideRectilinearPath(result, 7, 7)).toBe(false)
    expect(isInsideRectilinearPath(result, 1, 1)).toBe(true)
  })

  it('handles a hole containing an earlier hole and one opening onto the outside', () => {
    const subject = rectangle(0, 0, 10, 10)
    const first = rectangle(2, 2, 4, 4)
    expect(getArea(subtractClosedPaths(subject, [first, rectangle(1, 1, 6, 6)]))).toBeCloseTo(64, 8)
    const opened = subtractClosedPaths(subject, [first, rectangle(4, -1, 4, 8)])
    expect(getArea(opened)).toBeCloseTo(64, 8)
    expect(isInsideRectilinearPath(opened, 5, 0.5)).toBe(false)
    expect(isInsideRectilinearPath(opened, 3, 3)).toBe(false)
  })

  it('preserves a material island enclosed by several holes, including a later cut through it', () => {
    const result = subtractClosedPaths(rectangle(0, 0, 100, 100), [
      rectangle(10, 10, 80, 20),
      rectangle(10, 70, 80, 20),
      rectangle(10, 10, 20, 80),
      rectangle(70, 10, 20, 80),
    ])
    expect(getArea(result)).toBeCloseTo(5200, 8)
    expect(isInsideRectilinearPath(result, 50, 50)).toBe(true)
    expect(isInsideRectilinearPath(result, 20, 50)).toBe(false)
    const split = subtractClosedPaths(result, [rectangle(45, -10, 10, 120)])
    expect(getArea(split)).toBeCloseTo(4600, 8)
    expect(isInsideRectilinearPath(split, 50, 50)).toBe(false)
    expect(isInsideRectilinearPath(split, 40, 50)).toBe(true)
  })

  it('fills an existing hole during union and keeps holes during intersection', () => {
    const frame = subtractClosedPaths(rectangle(0, 0, 10, 10), [rectangle(2, 2, 6, 6)])
    const filled = unionClosedPaths(frame, [rectangle(1, 1, 8, 8)])
    expect(getArea(filled)).toBeCloseTo(100, 8)
    expect(isInsideRectilinearPath(filled, 5, 5)).toBe(true)
    const clipped = intersectClosedPaths(frame, rectangle(0, 0, 5, 10))
    expect(getArea(clipped)).toBeCloseTo(32, 8)
    expect(isInsideRectilinearPath(clipped, 3, 5)).toBe(false)
    expect(isInsideRectilinearPath(clipped, 1, 5)).toBe(true)
  })

  it('clips disconnected islands independently', () => {
    const islands = unionClosedPaths(rectangle(0, 0, 20, 20), [rectangle(40, 0, 20, 20)])
    const strip = rectangle(10, -10, 40, 40)
    expect(getArea(intersectClosedPaths(islands, strip))).toBeCloseTo(400, 8)
    expect(getArea(subtractClosedPaths(islands, [strip]))).toBeCloseTo(400, 8)
  })

  it('distinguishes coverage from being inside a hole', () => {
    const subject = rectangle(0, 0, 10, 10)
    const hole = rectangle(2, 2, 6, 6)
    const frame = subtractClosedPaths(subject, [hole])
    expect(isClosedPathCoveredBy(hole, subject)).toBe(true)
    expect(isClosedPathCoveredBy(hole, frame)).toBe(false)
    expect(isClosedPathCoveredBy(frame, subject)).toBe(true)
  })

  it('handles empty and identical operands', () => {
    const empty: PathSchema = { commands: [] }
    const subject = rectangle(0, 0, 10, 10)
    expect(subtractClosedPaths(subject, [subject]).commands).toEqual([])
    expect(intersectClosedPaths(subject, empty).commands).toEqual([])
    expect(getArea(unionClosedPaths(empty, [subject]))).toBeCloseTo(100, 8)
    expect(isClosedPathCoveredBy(empty, subject)).toBe(true)
    expect(isClosedPathCoveredBy(subject, empty)).toBe(false)
  })
})

describe.each(['horizontal', 'vertical'] as const)('nearby %s hole boundaries', (orientation) => {
  const gaps = [-0.0001, -0.000011, -0.000009, -0.000001, 0, 0.000001, 0.000005, 0.000009, 0.000011, 0.0001]

  it.each(gaps)('keeps the correct area and material for separation %s mm', (gap) => {
    const subject = rectangle(0, 0, 100, 100)
    const first = rectangle(20, 20, 20, 20)
    const second = orientation === 'horizontal' ? rectangle(40 + gap, 25, 20, 10) : rectangle(25, 40 + gap, 10, 20)
    const result = subtractClosedPaths(subject, [first, second])
    expect(getArea(result)).toBeCloseTo(9400 + Math.max(-gap, 0) * 10, 8)
    if (gap !== 0) {
      const x = orientation === 'horizontal' ? 40 + gap / 2 : 30
      const y = orientation === 'vertical' ? 40 + gap / 2 : 30
      expect(isInsideRectilinearPath(result, x, y)).toBe(gap > 0)
    }
    expect(getArea(subtractClosedPaths(subject, [second, first]))).toBeCloseTo(getArea(result), 8)
  })

  it.each([10, 20])('keeps a near-contact cut closed at position %s with a rounded outer boundary', (position) => {
    const first = rectangle(position, 20, 20, 20)
    const second =
      orientation === 'horizontal'
        ? rectangle(position + 20.000001, 25, 20, 10)
        : rectangle(position + 5, 40.000001, 10, 20)
    const result = subtractClosedPaths(rectangle(0, 0, 100, 100, 10), [first, second])
    expect(getArea(result)).toBeCloseTo(9400 - (4 - Math.PI) * 100, 7)
  })
})

describe('near-contact regression matrix', () => {
  const cases: NearContactCase[] = []
  for (const radius of [0, 5, 10]) {
    for (const gap of [
      -0.0001, -0.000011, -0.000009, -0.000001, -0.0000001, 0, 0.0000001, 0.000001, 0.000009, 0.000011, 0.0001,
    ]) {
      for (const orientation of ['horizontal', 'vertical'] as const) {
        for (const position of [0, 10, 20]) {
          cases.push({ radius, gap, orientation, position })
        }
      }
    }
  }

  it.each(cases)('handles $orientation holes at $position with radius $radius and gap $gap', (testCase) => {
    const { radius, gap, orientation, position } = testCase
    const subject = rectangle(0, 0, 100, 100, 10)
    const first = rectangle(position, 20, 20, 20, radius)
    const second =
      orientation === 'horizontal'
        ? rectangle(position + 20 + gap, 25, 20, 10, Math.min(radius, 5))
        : rectangle(position + 5, 40 + gap, 10, 20, Math.min(radius, 5))
    const result = subtractClosedPaths(subject, [first, second])
    const resultArea = getArea(result)
    const subjectArea = 10000 - (4 - Math.PI) * 100
    const firstArea = 400 - (4 - Math.PI) * radius ** 2
    const secondArea = 200 - (4 - Math.PI) * Math.min(radius, 5) ** 2

    expect(resultArea).toBeGreaterThanOrEqual(subjectArea - firstArea - secondArea - 1e-7)
    expect(resultArea).toBeLessThanOrEqual(subjectArea - Math.max(firstArea, secondArea) + 1e-7)
    if (gap >= 0) {
      expect(resultArea).toBeCloseTo(subjectArea - firstArea - secondArea, 7)
    }
    expect(getArea(subtractClosedPaths(subject, [second, first]))).toBeCloseTo(resultArea, 7)
    expect(getArea(unionClosedPaths(result, [first, second]))).toBeCloseTo(subjectArea, 7)
    expect(getArea(intersectClosedPaths(result, first))).toBeCloseTo(0, 7)
  })
})

describe('circular boundaries', () => {
  it.each([15, 30])('subtracts two radius-15 circles with center distance %s, retaining their radii', (distance) => {
    const radius = 15
    const first = rectangle(20, 35, 30, 30, radius)
    const second = rectangle(20 + distance, 35, 30, 30, radius)
    const result = subtractClosedPaths(rectangle(0, 0, 100, 100), [first, second])
    const lens =
      2 * radius ** 2 * Math.acos(distance / (2 * radius)) - (distance * Math.sqrt(4 * radius ** 2 - distance ** 2)) / 2
    expect(getArea(result)).toBeCloseTo(10000 - (2 * Math.PI * radius ** 2 - lens), 7)
    const arcs = getClosedPathLoops(result).flat().filter(narrowers.path.is.arcSegment)
    expect(arcs.length).toBeGreaterThan(0)
    arcs.forEach((arc) => expect(arc.radius.toNumber()).toBeCloseTo(radius, 10))
  })
})
