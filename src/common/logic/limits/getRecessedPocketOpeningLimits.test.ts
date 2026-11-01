import BigNumber from 'bignumber.js'
import { describe, expect, it } from 'vitest'
import { POSITION_EPSILON, ZERO_CORNER_RADIUS } from '../../constants/layout'
import type { FrontPocketSchema, PocketOrientationSchema, TPocketSchema } from '../../schemas/components'
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
    outerInset: 35,
    innerOffset: 15,
    depth: 15,
    outerRadius: 5,
    innerRadius: 15,
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
  it('preserves the inner offset and bounds the outer inset', () => {
    const { limits } = createFixture({ outerInset: 45, innerOffset: 15 })
    expect(limits.outerInset?.max?.value.toNumber()).toBe(35)
    expect(limits.innerOffset?.max?.value.toNumber()).toBe(50)
  })
  it.each([
    [{ depth: 100 }, {}, 79, 'pocket-opening-depth'],
    [{ outerInset: 10, innerOffset: 35, depth: 30 }, { tPocketTabWidth: 20 }, 10, 'pocket-opening-boundary'],
    [
      { outerInset: 10, innerOffset: 15, depth: 40 },
      { tPocketTabWidth: 20, tPocketTaper: 20 },
      25,
      'pocket-opening-boundary',
    ],
    [
      { outerInset: 20, innerOffset: 25, depth: 60 },
      { tPocketTabWidth: 10, tPocketTaper: 40 },
      45,
      'pocket-opening-boundary',
    ],
  ] as const)('bounds recess depth for %o', (opening, shape, value, reason) => {
    const { limits } = createFixture(opening, shape)
    expect(limits.depth?.max?.value.toNumber()).toBeCloseTo(value, 7)
    expect(limits.depth?.max?.reason).toBe(reason)
  })
  it('respects the actual front pocket closed corners', () => {
    const { limits } = createFixture({ outerInset: 5, innerOffset: 40, depth: 100 }, {}, 'up', {
      bottomLeftRadius: 40,
      bottomRightRadius: 30,
    })
    expect(limits.depth?.max?.value.toNumber()).toBeCloseTo(60 + Math.sqrt(700), 7)
  })
  it('leaves material between an unrounded recess and the T-pocket shoulder', () => {
    const { opening, source, cluster, computed, limits } = createFixture(
      { outerInset: 10, innerOffset: 15, depth: 40, innerRadius: 0, outerRadius: 0 },
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
      { outerInset: 20, innerOffset: 25, depth: 60, innerRadius: 0, outerRadius: 0 },
      { tPocketTabWidth: 10, tPocketTaper: 40 },
    )
    const adjusted = getAdjustedPocketOpening(opening, limits)
    if (!narrowers.is.recessedPocketOpening(adjusted)) {
      throw new Error('Expected a recessed opening')
    }
    const sideX = new BigNumber(adjusted.depth).minus(10).times(30).dividedBy(70).plus(10)
    const clearance = new BigNumber(25).minus(sideX)
    expect(clearance.gt(0)).toBe(true)
    expect(clearance.toNumber()).toBeCloseTo(POSITION_EPSILON, 12)
  })
  it.each([0, 5, 30, 100])('keeps the R15 inner circle with outer radius %s', (outerRadius) => {
    const { opening, limits } = createFixture({ outerRadius })
    expect(getAdjustedPocketOpening(opening, limits)).toMatchObject({ innerRadius: 15 })
  })
  it('finds an outer radius that clears the actual T-pocket shoulder', () => {
    const { limits, opening } = createFixture(
      { outerInset: 40, innerOffset: 10, depth: 25, innerRadius: 7, outerRadius: 50 },
      { tPocketTabWidth: 39, tPocketTaper: 10 },
    )
    expect(limits.outerRadius?.max?.reason).toBe('pocket-opening-boundary')
    expect(limits.outerRadius?.max?.value.toNumber()).toBeGreaterThan(0)
    expect(limits.outerRadius?.max?.value.toNumber()).toBeLessThan(50)
    expect(getAdjustedPocketOpening(opening, limits)).toMatchObject({ innerRadius: 7 })
  })
  it('does not constrain radii at zero depth', () => {
    const { limits } = createFixture({ depth: 0, innerRadius: 100, outerRadius: 200 })
    expect(limits.innerRadius).toBeUndefined()
    expect(limits.outerRadius).toBeUndefined()
  })
  it.each<PocketOrientationSchema>(['up', 'right', 'down', 'left'])(
    'keeps corrected arcs from crossing facing %s',
    (orientation) => {
      const { opening, source, cluster, computed, limits } = createFixture(
        { outerInset: 42, innerOffset: 8, depth: 10, outerRadius: 55, innerRadius: 39 },
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
