import BigNumber from 'bignumber.js'
import { describe, expect, it } from 'vitest'
import { POSITION_EPSILON, ZERO_CORNER_RADIUS } from '../../constants/layout'
import type { FrontPocketSchema, PocketOrientationSchema, TPocketSchema } from '../../schemas/components'
import type { RecessedPocketOpeningLimitsReasonSchema } from '../../schemas/limits'
import type { RecessedPocketOpeningSchema } from '../../schemas/pocketOpening'
import { d } from '../../testData'
import { narrowers } from '../../utils/narrowers'
import { calculatePocketClusterGeometry } from '../calculatePocketClusterGeometry'
import { getAdjustedPocketOpening } from '../getAdjustedPocketOpening'
import { getPathSegmentIntersections } from '../pathSegmentIntersections'
import { getPathSegments } from '../pathSegments'
import type { LinePathSegment } from '../pathSegmentTypes'
import { createPocketCalculator } from '../pockets/createPocketCalculator'
import { getRecessedPocketOpeningLimits } from './getRecessedPocketOpeningLimits'

type RecessDepthTestCase = [
  opening: Partial<RecessedPocketOpeningSchema>,
  shape: Partial<TPocketSchema>,
  value: number,
  reason: RecessedPocketOpeningLimitsReasonSchema,
]

const createFixture = (
  overrides: Partial<RecessedPocketOpeningSchema> = {},
  tOverrides: Partial<TPocketSchema> = {},
  orientation: PocketOrientationSchema = 'up',
  frontOverrides?: Partial<FrontPocketSchema>,
) => {
  const opening: RecessedPocketOpeningSchema = {
    id: 'opening',
    name: 'Opening',
    type: 'recessed',
    recessStartMargin: 0,
    recessEndMargin: 0,
    recessOuterInset: 35,
    recessInnerOffset: 15,
    recessDepth: 15,
    recessOuterRadius: 5,
    recessInnerRadius: 15,
    ...overrides,
  }
  const pocket = d.tPocket({ id: 't', openingId: opening.id, ...tOverrides })
  const front = d.frontPocket({ id: 'front', openingId: opening.id, ...frontOverrides })
  const source = frontOverrides === undefined ? pocket : front
  const cluster = d.pocketCluster({
    id: 'cluster',
    orientation,
    pocketStep: 10,
    children: frontOverrides === undefined ? ['t', 't2', 'front'] : ['front'],
  })
  const rect = { x: new BigNumber(11), y: new BigNumber(17), width: new BigNumber(100), height: new BigNumber(100) }
  const pockets = frontOverrides === undefined ? [pocket, d.tPocket({ id: 't2' }), front] : [front]
  const geometry = calculatePocketClusterGeometry(
    cluster,
    pockets,
    rect,
    ZERO_CORNER_RADIUS,
    d.subProject({ id: 'sub', root: d.rootPanel({ id: 'root' }), components: pockets, pocketOpenings: [opening] }),
  )
  const computed = geometry.children[0]
  return {
    opening,
    source,
    cluster,
    computed,
    limits: getRecessedPocketOpeningLimits(opening, source, cluster, computed),
  }
}
describe('getRecessedPocketOpeningLimits', () => {
  it.each([
    [80, 10, 80, 10],
    [80, 30, 70 - POSITION_EPSILON, 30],
    [30, 80, 30, 70 - POSITION_EPSILON],
    [80, 70, 50 - POSITION_EPSILON / 2, 50 - POSITION_EPSILON / 2],
    [100, 0, 100 - POSITION_EPSILON, 0],
  ])('shares opening width for margins %s / %s', (start, end, expectedStart, expectedEnd) => {
    const { opening, limits } = createFixture({ recessStartMargin: start, recessEndMargin: end })
    const adjusted = getAdjustedPocketOpening(opening, limits)
    if (!narrowers.is.recessedPocketOpening(adjusted)) {
      throw new Error('Expected a recessed opening')
    }
    expect(adjusted.recessStartMargin).toBeCloseTo(expectedStart, 12)
    expect(adjusted.recessEndMargin).toBeCloseTo(expectedEnd, 12)
    expect(limits.recessStartMargin?.max?.reason).toBe('recessed-pocket-opening-margins-share-width')
    expect(limits.recessEndMargin?.max?.reason).toBe('recessed-pocket-opening-margins-share-width')
    expect(opening.recessStartMargin).toBe(start)
    expect(opening.recessEndMargin).toBe(end)
  })

  it('reserves margins before bounding inner offset and outer inset', () => {
    const { limits } = createFixture({
      recessStartMargin: 5,
      recessEndMargin: 10,
      recessInnerOffset: 15,
      recessOuterInset: 45,
    })
    expect(limits.recessInnerOffset?.max?.value.toNumber()).toBe(42.5)
    expect(limits.recessOuterInset?.max?.value.toNumber()).toBe(27.5)
    const { opening, limits: narrowLimits } = createFixture({
      recessStartMargin: 40,
      recessEndMargin: 30,
      recessInnerOffset: 100,
      recessOuterInset: 100,
    })
    expect(getAdjustedPocketOpening(opening, narrowLimits)).toMatchObject({
      recessStartMargin: 40,
      recessEndMargin: 30,
      recessInnerOffset: 15,
      recessOuterInset: 0,
    })
  })

  it.each<PocketOrientationSchema>(['up', 'right', 'down', 'left'])(
    'checks both front-pocket corners with asymmetric margins facing %s',
    (orientation) => {
      const radii: Record<PocketOrientationSchema, Partial<FrontPocketSchema>> = {
        up: { bottomLeftRadius: 40, bottomRightRadius: 30 },
        right: { topLeftRadius: 40, bottomLeftRadius: 30 },
        down: { topRightRadius: 40, topLeftRadius: 30 },
        left: { bottomRightRadius: 40, topRightRadius: 30 },
      }
      const first = createFixture(
        { recessStartMargin: 5, recessEndMargin: 15, recessOuterInset: 5, recessInnerOffset: 30, recessDepth: 100 },
        {},
        orientation,
        radii[orientation],
      )
      expect(first.limits.recessDepth?.max?.value.toNumber()).toBeCloseTo(60 + Math.sqrt(975), 7)
      const second = createFixture(
        { recessStartMargin: 15, recessEndMargin: 5, recessOuterInset: 5, recessInnerOffset: 30, recessDepth: 100 },
        {},
        orientation,
        radii[orientation],
      )
      expect(second.limits.recessDepth?.max?.value.toNumber()).toBeCloseTo(70 + Math.sqrt(675), 7)
    },
  )

  it.each([
    [5, 15],
    [15, 5],
  ])('checks both T-pocket boundaries for margins %s / %s', (start, end) => {
    const shoulder = createFixture(
      {
        recessStartMargin: start,
        recessEndMargin: end,
        recessOuterInset: 10,
        recessInnerOffset: 15,
        recessDepth: 60,
        recessOuterRadius: 0,
        recessInnerRadius: 0,
      },
      { tPocketTabWidth: 20, tPocketTaper: 20 },
    )
    expect(shoulder.limits.recessDepth?.max?.value.toNumber()).toBeCloseTo(30, 5)
    const taper = createFixture(
      {
        recessStartMargin: start,
        recessEndMargin: end,
        recessOuterInset: 15,
        recessInnerOffset: 25,
        recessDepth: 60,
        recessOuterRadius: 0,
        recessInnerRadius: 0,
      },
      { tPocketTabWidth: 10, tPocketTaper: 40 },
    )
    expect(taper.limits.recessDepth?.max?.value.toNumber()).toBeCloseTo(10 + 70 / 3, 5)
  })

  it.each([0, POSITION_EPSILON / 2, 100])(
    'keeps corrected geometry finite with excessive margins at width %s',
    (width) => {
      const { opening, source, cluster, computed } = createFixture({ recessStartMargin: 100, recessEndMargin: 100 })
      const resized = { ...computed, boundingRect: { ...computed.boundingRect, width: new BigNumber(width) } }
      const limits = getRecessedPocketOpeningLimits(opening, source, cluster, resized)
      const adjusted = getAdjustedPocketOpening(opening, limits)
      const path = createPocketCalculator(
        source,
        cluster,
        adjusted,
        resized.boundingRect,
        resized.cornerRadius,
      ).getPocketOpeningPath()
      for (const command of path.commands) {
        if (!narrowers.path.is.close(command)) {
          expect(command.point.x.isFinite() && command.point.y.isFinite()).toBe(true)
        }
      }
      if (!narrowers.is.recessedPocketOpening(adjusted)) {
        throw new Error('Expected a recessed opening')
      }
      expect(new BigNumber(width).minus(adjusted.recessStartMargin).minus(adjusted.recessEndMargin).gte(0)).toBe(true)
    },
  )

  it.each([
    [5, 15],
    [15, 5],
  ])('keeps outer arcs out of margins %s / %s and clear of both T-pocket lower edges', (start, end) => {
    const { opening, source, cluster, computed, limits } = createFixture(
      {
        recessStartMargin: start,
        recessEndMargin: end,
        recessOuterInset: 30,
        recessInnerOffset: 10,
        recessDepth: 25,
        recessInnerRadius: 7,
        recessOuterRadius: 100,
      },
      { tPocketTabWidth: 30, tPocketTaper: 10 },
    )
    const path = createPocketCalculator(
      source,
      cluster,
      getAdjustedPocketOpening(opening, limits),
      computed.boundingRect,
      computed.cornerRadius,
    ).getPocketOpeningPath()
    const segments = getPathSegments(path)
    for (const segment of segments) {
      if (narrowers.path.is.arcSegment(segment)) {
        expect(BigNumber.minimum(segment.start.x, segment.end.x).gte(start)).toBe(true)
        expect(BigNumber.maximum(segment.start.x, segment.end.x).lte(100 - end)).toBe(true)
      }
    }
    const boundary: LinePathSegment = {
      type: 'line',
      start: { x: new BigNumber(0), y: new BigNumber(10) },
      end: { x: new BigNumber(100), y: new BigNumber(10) },
    }
    const crossings = segments.flatMap((segment) => getPathSegmentIntersections(segment, boundary))
    expect(crossings).toHaveLength(2)
    for (const crossing of crossings) {
      expect(crossing.point.x.gt(30)).toBe(true)
      expect(crossing.point.x.lt(70)).toBe(true)
    }
  })

  it('preserves the inner offset and bounds the outer inset', () => {
    const { limits } = createFixture({ recessOuterInset: 45, recessInnerOffset: 15 })
    expect(limits.recessOuterInset?.max?.value.toNumber()).toBe(35)
    expect(limits.recessInnerOffset?.max?.value.toNumber()).toBe(50)
  })
  it.each<RecessDepthTestCase>([
    [{ recessDepth: 100 }, {}, 79, 'pocket-opening-depth'],
    [
      { recessOuterInset: 10, recessInnerOffset: 35, recessDepth: 30 },
      { tPocketTabWidth: 20 },
      10,
      'pocket-opening-boundary',
    ],
    [
      { recessOuterInset: 10, recessInnerOffset: 15, recessDepth: 40 },
      { tPocketTabWidth: 20, tPocketTaper: 20 },
      25,
      'pocket-opening-boundary',
    ],
    [
      { recessOuterInset: 20, recessInnerOffset: 25, recessDepth: 60 },
      { tPocketTabWidth: 10, tPocketTaper: 40 },
      45,
      'pocket-opening-boundary',
    ],
  ])('bounds recess depth for %o', (opening, shape, value, reason) => {
    const { limits } = createFixture(opening, shape)
    expect(limits.recessDepth?.max?.value.toNumber()).toBeCloseTo(value, 7)
    expect(limits.recessDepth?.max?.reason).toBe(reason)
  })
  it('respects the actual front pocket closed corners', () => {
    const { limits } = createFixture({ recessOuterInset: 5, recessInnerOffset: 40, recessDepth: 100 }, {}, 'up', {
      bottomLeftRadius: 40,
      bottomRightRadius: 30,
    })
    expect(limits.recessDepth?.max?.value.toNumber()).toBeCloseTo(60 + Math.sqrt(700), 7)
  })
  it('leaves material between an unrounded recess and the T-pocket shoulder', () => {
    const { opening, source, cluster, computed, limits } = createFixture(
      { recessOuterInset: 10, recessInnerOffset: 15, recessDepth: 40, recessInnerRadius: 0, recessOuterRadius: 0 },
      { tPocketTabWidth: 20, tPocketTaper: 20 },
    )
    const path = createPocketCalculator(
      source,
      cluster,
      getAdjustedPocketOpening(opening, limits),
      computed.boundingRect,
      computed.cornerRadius,
    ).getPocketOpeningPath()
    const shoulder: LinePathSegment = {
      type: 'line',
      start: { x: new BigNumber(0), y: new BigNumber(10) },
      end: { x: new BigNumber(100), y: new BigNumber(10) },
    }
    const hits = getPathSegments(path).flatMap((segment) => getPathSegmentIntersections(segment, shoulder))
    const left = hits.filter((hit) => hit.point.x.lt(50))
    expect(left).toHaveLength(1)
    const clearance = left[0].point.x.minus(20)
    expect(clearance.gt(0)).toBe(true)
    expect(clearance.toNumber()).toBeCloseTo(POSITION_EPSILON, 12)
  })

  it('leaves material between the recess bottom and the tapered side', () => {
    const { opening, limits } = createFixture(
      { recessOuterInset: 20, recessInnerOffset: 25, recessDepth: 60, recessInnerRadius: 0, recessOuterRadius: 0 },
      { tPocketTabWidth: 10, tPocketTaper: 40 },
    )
    const adjusted = getAdjustedPocketOpening(opening, limits)
    if (!narrowers.is.recessedPocketOpening(adjusted)) {
      throw new Error('Expected a recessed opening')
    }
    const sideX = new BigNumber(adjusted.recessDepth).minus(10).times(30).dividedBy(70).plus(10)
    const clearance = new BigNumber(25).minus(sideX)
    expect(clearance.gt(0)).toBe(true)
    expect(clearance.toNumber()).toBeCloseTo(POSITION_EPSILON, 12)
  })
  it.each([0, 5, 30, 100])('keeps the R15 inner circle with outer radius %s', (outerRadius) => {
    const { opening, limits } = createFixture({ recessOuterRadius: outerRadius })
    const adjusted = getAdjustedPocketOpening(opening, limits)
    if (!narrowers.is.recessedPocketOpening(adjusted)) {
      throw new Error('Expected a recessed opening')
    }
    expect(adjusted.recessInnerRadius).toBe(15)
  })
  it('finds an outer radius that clears the actual T-pocket shoulder', () => {
    const { limits, opening } = createFixture(
      { recessOuterInset: 40, recessInnerOffset: 10, recessDepth: 25, recessInnerRadius: 7, recessOuterRadius: 50 },
      { tPocketTabWidth: 39, tPocketTaper: 10 },
    )
    expect(limits.recessOuterRadius?.max?.reason).toBe('pocket-opening-boundary')
    expect(limits.recessOuterRadius?.max?.value.toNumber()).toBeGreaterThan(0)
    expect(limits.recessOuterRadius?.max?.value.toNumber()).toBeLessThan(50)
    const adjusted = getAdjustedPocketOpening(opening, limits)
    if (!narrowers.is.recessedPocketOpening(adjusted)) {
      throw new Error('Expected a recessed opening')
    }
    expect(adjusted.recessInnerRadius).toBe(7)
  })
  it('does not bind radii at zero depth', () => {
    const { limits } = createFixture({ recessDepth: 0, recessInnerRadius: 100, recessOuterRadius: 200 })
    expect(limits.recessInnerRadius).toBeUndefined()
    expect(limits.recessOuterRadius).toBeUndefined()
  })
  it.each<PocketOrientationSchema>(['up', 'right', 'down', 'left'])(
    'keeps corrected arcs from crossing facing %s',
    (orientation) => {
      const { opening, source, cluster, computed, limits } = createFixture(
        { recessOuterInset: 42, recessInnerOffset: 8, recessDepth: 10, recessOuterRadius: 55, recessInnerRadius: 39 },
        {},
        orientation,
      )
      const before = JSON.stringify({ opening, source, computed })
      const segments = getPathSegments(
        createPocketCalculator(
          source,
          cluster,
          getAdjustedPocketOpening(opening, limits),
          computed.boundingRect,
          computed.cornerRadius,
        ).getPocketOpeningPath(),
      )
      for (let first = 0; first < segments.length; first += 1) {
        for (let second = first + 2; second < segments.length; second += 1) {
          for (const hit of getPathSegmentIntersections(segments[first], segments[second])) {
            expect(
              (hit.firstProgress.gt('0.00000001') && hit.firstProgress.lt('0.99999999')) ||
                (hit.secondProgress.gt('0.00000001') && hit.secondProgress.lt('0.99999999')),
            ).toBe(false)
          }
        }
      }
      expect(JSON.stringify({ opening, source, computed })).toBe(before)
    },
  )
})
