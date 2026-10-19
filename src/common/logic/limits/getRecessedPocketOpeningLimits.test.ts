import BigNumber from 'bignumber.js'
import { describe, expect, it } from 'vitest'

import type {
  PocketClusterSchema,
  PocketOrientationSchema,
  RecessedPocketOpeningSchema,
} from '../../schemas/components'
import type { ComputedTopPocketSchema, ComputedTPocketSchema } from '../../schemas/computed'
import type { RectSchema } from '../../schemas/geometry'
import type { LimitReasonSchema, NumericBoundSchema, RecessedPocketOpeningLimitsSchema } from '../../schemas/limits'
import { d } from '../../testData'
import { calculatePocketClusterGeometry } from '../calculatePocketClusterGeometry'
import { calculateRecessedPocketOpeningPath } from '../calculateRecessedPocketOpeningPath'
import { getCornerRadius } from '../cornerRadiusUtils'
import { getAdjustedPocketOpening } from '../getAdjustedPocketOpening'
import { getPathSegmentIntersections } from '../pathSegmentIntersections'
import { getPathSegments } from '../pathSegments'
import { getRecessedPocketOpeningLimits } from './getRecessedPocketOpeningLimits'

type OpeningLimitsFixture = {
  opening: RecessedPocketOpeningSchema
  pocketCluster: PocketClusterSchema
  frontPocket: ComputedTopPocketSchema
  tPockets: ComputedTPocketSchema[]
  limits: RecessedPocketOpeningLimitsSchema
}

const createFixture = (
  overrides: Partial<RecessedPocketOpeningSchema> = {},
  clusterOverrides: Partial<PocketClusterSchema> = {},
  width = 100,
  height = 100,
): OpeningLimitsFixture => {
  const opening: RecessedPocketOpeningSchema = {
    id: 'own:default',
    name: 'Default',
    type: 'recessed',
    outerInset: 35,
    innerOffset: 15,
    depth: 15,
    outerRadius: 5,
    innerRadius: 15,
    ...overrides,
  }
  const pocketCluster = d.pocketCluster({
    id: 'cluster',
    pocketCount: 3,
    pocketStep: 10,
    tPocketTabWidth: 8,
    tPocketTaper: 20,
    topLeftRadius: 0,
    topRightRadius: 0,
    bottomLeftRadius: 0,
    bottomRightRadius: 0,
    defaultOpening: opening,
    ...clusterOverrides,
  })
  const rect: RectSchema = {
    x: new BigNumber(11),
    y: new BigNumber(17),
    width: new BigNumber(width),
    height: new BigNumber(height),
  }
  const geometry = calculatePocketClusterGeometry(
    { ...pocketCluster, defaultOpening: { ...opening, type: 'straight' }, openings: [], openingMapping: {} },
    rect,
    getCornerRadius(pocketCluster),
  )
  return {
    opening,
    pocketCluster,
    ...geometry,
    limits: getRecessedPocketOpeningLimits(opening, pocketCluster, geometry.frontPocket, geometry.tPockets),
  }
}

const expectBound = (actual: NumericBoundSchema | undefined, value: number, reason: LimitReasonSchema): void => {
  expect(actual?.value.toNumber()).toBeCloseTo(value, 7)
  expect(actual?.reason).toBe(reason)
  expect(actual?.severity).toBe('warning')
}

describe('getRecessedPocketOpeningLimits', () => {
  it('preserves the inner offset and limits the outer inset before it crosses the inner corner', () => {
    const { limits } = createFixture({ outerInset: 45, innerOffset: 15 })
    expectBound(limits.outerInset?.max, 35, 'pocket-opening-width')
    expectBound(limits.innerOffset?.max, 50, 'pocket-opening-width')
  })

  it('reserves opening-side corner space before bounding the offsets', () => {
    const { limits } = createFixture({ outerInset: 0, innerOffset: 49 }, { topLeftRadius: 8, topRightRadius: 3 })
    expectBound(limits.outerInset?.min, 8, 'pocket-opening-corner-clearance')
    expectBound(limits.innerOffset?.max, 42, 'pocket-opening-corner-clearance')
    expectBound(limits.outerInset?.max, 8, 'pocket-opening-width')
  })

  it('leaves one millimetre below the recess', () => {
    const { limits } = createFixture({ depth: 100 })
    expectBound(limits.depth?.max, 79, 'pocket-opening-depth')
  })

  it('stops the unrounded recess at the T shoulder when its inner corner is too wide', () => {
    const { limits } = createFixture({ outerInset: 10, innerOffset: 35, depth: 30 }, { tPocketTabWidth: 20 })
    expectBound(limits.depth?.max, 10, 'pocket-opening-boundary')
  })

  it('limits depth where the sloping recess side would cross the T shoulder', () => {
    const { limits } = createFixture(
      { outerInset: 10, innerOffset: 15, depth: 40 },
      { tPocketTabWidth: 20, tPocketTaper: 20 },
    )
    expectBound(limits.depth?.max, 25, 'pocket-opening-boundary')
  })

  it('limits depth where the bottom of the recess would cross the tapered T edge', () => {
    const { limits } = createFixture(
      { outerInset: 20, innerOffset: 25, depth: 60 },
      { tPocketTabWidth: 10, tPocketTaper: 40 },
    )
    expectBound(limits.depth?.max, 45, 'pocket-opening-boundary')
  })

  it('accounts for the closed corners of a front pocket', () => {
    const { limits } = createFixture(
      { outerInset: 5, innerOffset: 40, depth: 100 },
      {
        pocketCount: 1,
        bottomLeftRadius: 40,
        bottomRightRadius: 30,
      },
    )
    expectBound(limits.depth?.max, 60 + Math.sqrt(700), 'pocket-opening-boundary')
  })

  it('allows the R15 U shape and keeps R15 when the outer radius grows', () => {
    for (const outerRadius of [0, 5, 30, 100]) {
      const { opening, limits } = createFixture({ outerRadius })
      expectBound(limits.innerRadius?.max, 15, 'pocket-opening-width')
      expect(getAdjustedPocketOpening(opening, limits)).toMatchObject({ innerRadius: 15 })
    }
  })

  it('finds the outer radius maximum inside the T shoulder without reducing the inner radius', () => {
    const { opening, limits } = createFixture(
      { outerInset: 40, innerOffset: 10, depth: 25, innerRadius: 7, outerRadius: 50 },
      {
        pocketStep: 5,
        tPocketTabWidth: 39,
        tPocketTaper: 10,
      },
    )
    expect(limits.outerRadius?.max?.reason).toBe('pocket-opening-boundary')
    expect(limits.outerRadius?.max?.value.toNumber()).toBeGreaterThan(0)
    expect(limits.outerRadius?.max?.value.toNumber()).toBeLessThan(50)
    expect(getAdjustedPocketOpening(opening, limits)).toMatchObject({ innerRadius: 7 })
  })

  it('uses only assigned pockets, and both representative pockets when unassigned', () => {
    const fixture = createFixture({}, { topLeftRadius: 8 })
    const shared = { ...fixture.opening, id: 'own:shared' }
    const { pocketCluster, frontPocket, tPockets } = fixture
    const frontOnly: PocketClusterSchema = {
      ...pocketCluster,
      openings: [shared],
      openingMapping: { 3: shared.id },
    }
    const unused = getRecessedPocketOpeningLimits(shared, { ...frontOnly, openingMapping: {} }, frontPocket, tPockets)
    const front = getRecessedPocketOpeningLimits(shared, frontOnly, frontPocket, tPockets)
    const laterT = getRecessedPocketOpeningLimits(
      shared,
      { ...frontOnly, openingMapping: { 2: shared.id } },
      frontPocket,
      tPockets,
    )
    const firstT = getRecessedPocketOpeningLimits(
      shared,
      { ...frontOnly, openingMapping: { 1: shared.id } },
      frontPocket,
      tPockets,
    )
    expectBound(unused.outerInset?.min, 8, 'pocket-opening-corner-clearance')
    expectBound(firstT.outerInset?.min, 8, 'pocket-opening-corner-clearance')
    expectBound(front.outerInset?.min, 0, 'pocket-opening-corner-clearance')
    expectBound(laterT.outerInset?.min, 0, 'pocket-opening-corner-clearance')
  })

  it('resolves missing opening references to the default opening', () => {
    const fixture = createFixture({}, { topLeftRadius: 8, openingMapping: { 1: 'own:missing', 3: 'own:missing' } })
    expectBound(fixture.limits.outerInset?.min, 8, 'pocket-opening-corner-clearance')
  })

  it('does not constrain radii at zero depth', () => {
    const { limits } = createFixture({ depth: 0, innerRadius: 100, outerRadius: 200 })
    expect(limits.innerRadius).toBeUndefined()
    expect(limits.outerRadius).toBeUndefined()
  })

  it('reduces depth to zero when the pocket is less than one millimetre deep', () => {
    const { limits } = createFixture({}, { pocketCount: 1 }, 100, 0.5)
    expectBound(limits.depth?.max, 0, 'pocket-opening-depth')
    expect(limits.innerRadius).toBeUndefined()
    expect(limits.outerRadius).toBeUndefined()
  })

  it.each<PocketOrientationSchema>(['up', 'down', 'left', 'right'])(
    'prevents crossing arcs facing %s',
    (orientation) => {
      const { opening, limits, frontPocket } = createFixture(
        { outerInset: 42, innerOffset: 8, depth: 10, outerRadius: 55, innerRadius: 39 },
        { orientation },
      )
      const adjusted = getAdjustedPocketOpening(opening, limits)
      if (adjusted.type !== 'recessed') {
        throw new Error('Expected recessed opening')
      }
      const segments = getPathSegments(
        calculateRecessedPocketOpeningPath(adjusted, frontPocket.boundingRect, orientation),
      )
      for (let i = 0; i < segments.length; i += 1) {
        for (let j = i + 2; j < segments.length; j += 1) {
          for (const intersection of getPathSegmentIntersections(segments[i], segments[j])) {
            const firstInterior =
              intersection.firstProgress.gt('0.00000001') && intersection.firstProgress.lt('0.99999999')
            const secondInterior =
              intersection.secondProgress.gt('0.00000001') && intersection.secondProgress.lt('0.99999999')
            expect(firstInterior || secondInterior).toBe(false)
          }
        }
      }
    },
  )

  it('does not modify the opening or computed pockets', () => {
    const fixture = createFixture({ outerInset: 100, innerOffset: 100, depth: 100, innerRadius: 100, outerRadius: 100 })
    const before = JSON.stringify(fixture)
    getRecessedPocketOpeningLimits(fixture.opening, fixture.pocketCluster, fixture.frontPocket, fixture.tPockets)
    expect(JSON.stringify(fixture)).toBe(before)
  })
})
