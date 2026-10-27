import BigNumber from 'bignumber.js'
import { describe, expect, it } from 'vitest'

import { ZERO_CORNER_RADIUS } from '../../constants/layout'
import { defaultExportParams, defaultOpticalIllusionPocketOpening, defaultStitchingSettings } from '../../defaultStates'
import type {
  OpticalIllusionPocketOpeningSchema,
  PocketOpeningSideSchema,
  PocketOrientationSchema,
} from '../../schemas/components'
import type { PathSchema, RectSchema } from '../../schemas/geometry'
import { d } from '../../testData'
import { getExportElementsForComponent } from '../exports/getExportElements'
import { getComputedSubProject } from '../getComputedSubProject'
import { getPathSegmentIntersections } from '../pathSegmentIntersections'
import { getPathSegments } from '../pathSegments'
import { getPathSegmentTangent } from '../pathSegmentUtils'
import { OpticalIllusionPocketCalculator } from './OpticalIllusionPocketCalculator'

const rect: RectSchema = {
  x: new BigNumber(0),
  y: new BigNumber(0),
  width: new BigNumber(100),
  height: new BigNumber(80),
}
const opening: OpticalIllusionPocketOpeningSchema = {
  ...defaultOpticalIllusionPocketOpening,
  direction: 'start',
}
const calculator = (input: OpticalIllusionPocketOpeningSchema = opening, depth = 80, index = 0) => {
  const cluster = d.pocketCluster({
    id: 'cluster',
    orientation: 'up',
    children: ['t', 'middle', 'front'],
    pocketStep: 15,
  })
  const pocket = d.tPocket({ id: cluster.children[index], opening: input, tPocketTabWidth: 20, tPocketTaper: 30 })
  return new OpticalIllusionPocketCalculator(
    pocket,
    cluster,
    input,
    { ...rect, height: new BigNumber(depth) },
    ZERO_CORNER_RADIUS,
  )
}
const points = (path: PathSchema): number[][] =>
  path.commands.flatMap((command) =>
    command.type === 'close' ? [] : [[command.point.x.toNumber(), command.point.y.toNumber()]],
  )

describe('OpticalIllusionPocketCalculator', () => {
  it.each<PocketOpeningSideSchema>(['start', 'end'])(
    'aligns every diagonal in the cluster for direction %s',
    (direction) => {
      const diagonals = [0, 1, 2].map((index) => {
        const slope = getPathSegments(calculator({ ...opening, direction }, 80, index).getPocketOpeningPath()).find(
          (segment) => !segment.start.y.eq(segment.end.y),
        )
        expect(slope).toBeDefined()
        if (slope === undefined) throw new Error('Missing diagonal')
        return [slope.start, slope.end].map((point) => ({
          x: direction === 'start' ? point.x.toNumber() : 100 - point.x.toNumber(),
          y: point.y.toNumber() + index * 15,
        }))
      })
      const slope = 15 / (80 / 3)
      const expected = diagonals[0][0].y + slope * diagonals[0][0].x
      for (const diagonal of diagonals) {
        for (const point of diagonal) expect(point.y + slope * point.x).toBeCloseTo(expected, 10)
      }
    },
  )

  it('allows independently configured pockets without changing their indices', () => {
    const middle = points(calculator({ ...opening, startInset: 20, endInset: 20 }, 80, 1).getPocketOpeningPath())
    expect(middle).toEqual([
      [0, 15],
      [40, 15],
      [60, 0],
      [100, 0],
    ])
  })

  it.each<PocketOpeningSideSchema>(['start', 'end'])('joins both radii tangentially for direction %s', (direction) => {
    const path = calculator({ ...opening, direction, leadingRadius: 4, trailingRadius: 7 }).getPocketOpeningPath()
    const segments = getPathSegments(path)
    expect(
      segments
        .filter((segment) => segment.type === 'arc')
        .map((segment) => segment.radius.toNumber())
        .sort(),
    ).toEqual([4, 7])
    for (let index = 1; index < segments.length; index += 1) {
      const previous = segments[index - 1]
      const current = segments[index]
      const incoming = getPathSegmentTangent(previous, previous.end)
      const outgoing = getPathSegmentTangent(current, current.start)
      const cross = incoming.x.times(outgoing.y).minus(incoming.y.times(outgoing.x))
      expect(cross.toNumber()).toBeCloseTo(0, 8)
      expect(incoming.x.times(outgoing.x).plus(incoming.y.times(outgoing.y)).gt(0)).toBe(true)
    }
  })

  it.each([
    { depth: 40, openingHeight: 15, shoulderDepth: 30 },
    { depth: 25, openingHeight: 15, shoulderDepth: 25 },
    { depth: 15, openingHeight: 15, shoulderDepth: 15 },
    { depth: 10, openingHeight: 10, shoulderDepth: 10 },
    { depth: 0, openingHeight: 0, shoulderDepth: 0 },
  ])('compresses tabs before the opening at depth $depth', ({ depth, openingHeight, shoulderDepth }) => {
    const calc = calculator(opening, depth)
    expect(points(calc.getPocketOpeningPath())[0]).toEqual([0, openingHeight])
    const path = calc.getTPocketPath()
    const vertices = points(path)
    expect(vertices).toContainEqual([0, shoulderDepth])
    for (const [x, y] of vertices) {
      expect(Number.isFinite(x) && Number.isFinite(y)).toBe(true)
      expect(y).toBeGreaterThanOrEqual(0)
      expect(y).toBeLessThanOrEqual(depth)
    }
    const segments = getPathSegments(path)
    for (let first = 0; first < segments.length; first += 1) {
      for (let second = first + 1; second < segments.length; second += 1) {
        const crossings = getPathSegmentIntersections(segments[first], segments[second])
        expect(
          crossings.some(
            (hit) =>
              hit.firstProgress.gt(1e-8) &&
              hit.firstProgress.lt(1 - 1e-8) &&
              hit.secondProgress.gt(1e-8) &&
              hit.secondProgress.lt(1 - 1e-8),
          ),
        ).toBe(false)
      }
    }
  })

  it('keeps zero-width, vertical and zero-height openings finite', () => {
    const cluster = d.pocketCluster({ id: 'cluster', children: ['t'], pocketStep: 0 })
    const pocket = d.tPocket({ id: 't', tPocketTabWidth: 0, tPocketTaper: 0 })
    const flat = new OpticalIllusionPocketCalculator(
      pocket,
      cluster,
      opening,
      { ...rect, width: new BigNumber(0) },
      ZERO_CORNER_RADIUS,
    )
    expect(points(flat.getTPocketPath()).every((point) => point.every(Number.isFinite))).toBe(true)
    const vertical = calculator({ ...opening, startInset: 50, endInset: 50 }).getPocketOpeningPath()
    expect(points(vertical)).toEqual([
      [0, 15],
      [50, 15],
      [50, 0],
      [100, 0],
    ])
  })

  it.each<PocketOrientationSchema>(['up', 'right', 'down', 'left'])(
    'keeps complete paths inside the %s pocket box',
    (orientation) => {
      const vertical = orientation === 'up' || orientation === 'down'
      const bounds = {
        x: new BigNumber(11),
        y: new BigNumber(17),
        width: new BigNumber(vertical ? 100 : 80),
        height: new BigNumber(vertical ? 80 : 100),
      }
      const cluster = d.pocketCluster({ id: 'cluster', children: ['t'], orientation, pocketStep: 15 })
      const pocket = d.tPocket({ id: 't', tPocketTabWidth: 20, tPocketTaper: 30 })
      const calc = new OpticalIllusionPocketCalculator(
        pocket,
        cluster,
        { ...opening, leadingRadius: 4, trailingRadius: 7 },
        bounds,
        ZERO_CORNER_RADIUS,
      )
      for (const path of [calc.getTPocketPath(), calc.getFrontPocketPath()]) {
        for (const [x, y] of points(path)) {
          expect(x).toBeGreaterThanOrEqual(11 - 1e-8)
          expect(x).toBeLessThanOrEqual(11 + bounds.width.toNumber() + 1e-8)
          expect(y).toBeGreaterThanOrEqual(17 - 1e-8)
          expect(y).toBeLessThanOrEqual(17 + bounds.height.toNumber() + 1e-8)
        }
      }
    },
  )

  it.each([0, 15, 25, 40])('processes compressed depth %s through holes, union, stitching and export', (depth) => {
    const cluster = d.pocketCluster({
      id: 'cluster',
      children: ['t', 'front'],
      orientation: 'up',
      pocketStep: 15,
      width: 100,
      height: depth + 15,
      autoWidth: false,
      autoHeight: false,
    })
    const t = d.tPocket({
      id: 't',
      opening: { ...opening, leadingRadius: 7, trailingRadius: 4 },
      tPocketTabWidth: 20,
      tPocketTaper: 30,
    })
    const front = d.frontPocket({ id: 'front', opening })
    const source = d.subProject({
      id: 'sub',
      root: d.rootPanel({ id: 'root', width: 150, height: 150, children: ['cluster'] }),
      components: [cluster, t, front],
      holes: [d.hole({ id: 'hole', componentId: 't', width: 2, height: 2 })],
      stitchLines: [d.tPocketStitchLine({ id: 'stitch', targetId: 't', targetType: 'component' })],
    })
    const snapshot = structuredClone(source)
    const computed = getComputedSubProject(source, defaultStitchingSettings)
    const exports = getExportElementsForComponent(
      source,
      computed,
      'cluster',
      defaultExportParams,
      defaultStitchingSettings,
    )
    expect(exports).toHaveLength(2)
    expect(source).toEqual(snapshot)
    for (const component of Object.values(computed.components)) {
      for (const [x, y] of points(component.path)) expect(Number.isFinite(x) && Number.isFinite(y)).toBe(true)
    }
  })
})
