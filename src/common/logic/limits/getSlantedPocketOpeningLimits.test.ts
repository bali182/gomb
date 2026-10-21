import BigNumber from 'bignumber.js'
import { describe, expect, it } from 'vitest'

import { ZERO_CORNER_RADIUS } from '../../constants/layout'
import type { PocketClusterSchema, PocketOrientationSchema, SlantedPocketOpeningSchema } from '../../schemas/components'
import type { CornerRadiusSchema } from '../../schemas/geometry'
import { d } from '../../testData'
import { calculatePocketClusterGeometry } from '../calculatePocketClusterGeometry'
import { getSlantedPocketOpeningLimits } from './getSlantedPocketOpeningLimits'

const opening: SlantedPocketOpeningSchema = {
  id: 'own:slanted',
  name: 'Slanted',
  type: 'slanted',
  offset: 15,
  side: 'end',
}
const createFixture = (
  overrides: Partial<PocketClusterSchema> = {},
  radius: CornerRadiusSchema = ZERO_CORNER_RADIUS,
) => {
  const cluster = d.pocketCluster({
    id: 'cluster',
    orientation: 'up',
    pocketCount: 3,
    pocketStep: 10,
    defaultOpening: opening,
    ...overrides,
  })
  const geometry = calculatePocketClusterGeometry(
    {
      ...cluster,
      defaultOpening: { id: 'own:straight', name: 'Straight', type: 'straight' },
      openings: [],
      openingMapping: {},
    },
    { x: new BigNumber(11), y: new BigNumber(17), width: new BigNumber(100), height: new BigNumber(100) },
    radius,
  )
  return { cluster, ...geometry }
}

describe('getSlantedPocketOpeningLimits', () => {
  it('reserves the T-pocket shoulder depth and takes the strictest assigned pocket', () => {
    const { cluster, frontPocket, tPockets } = createFixture()
    const result = getSlantedPocketOpeningLimits(opening, cluster, frontPocket, tPockets)
    expect(result.offset?.max?.value.toNumber()).toBe(70)
    expect(result.offset?.max?.reason).toBe('slanted-pocket-opening-offset-exceeds-pocket')
    expect(result.offset?.max?.severity).toBe('warning')
  })

  it('uses front-only, T-only, shared, unused and missing-reference assignments', () => {
    const radius = { ...ZERO_CORNER_RADIUS, bottomRight: new BigNumber(30) }
    const { cluster, frontPocket, tPockets } = createFixture({}, radius)
    const shared: SlantedPocketOpeningSchema = { ...opening, id: 'own:shared' }
    for (const [mapping, maximum] of [
      [{ 3: shared.id }, 50],
      [{ 2: shared.id }, 70],
      [{ 1: shared.id, 3: shared.id }, 50],
      [{}, 50],
    ] as const) {
      const result = getSlantedPocketOpeningLimits(
        shared,
        { ...cluster, openings: [shared], openingMapping: mapping },
        frontPocket,
        tPockets,
      )
      expect(result.offset?.max?.value.toNumber()).toBe(maximum)
    }
    expect(
      getSlantedPocketOpeningLimits(
        opening,
        { ...cluster, openingMapping: { 1: 'own:missing', 3: 'own:missing' } },
        frontPocket,
        tPockets,
      ).offset?.max?.value.toNumber(),
    ).toBe(50)
  })

  it.each<PocketOrientationSchema>(['up', 'right', 'down', 'left'])(
    'uses the selected endpoint closed radius facing %s',
    (orientation) => {
      const radius = {
        topLeft: new BigNumber(3),
        topRight: new BigNumber(5),
        bottomLeft: new BigNumber(7),
        bottomRight: new BigNumber(11),
      }
      const { cluster, frontPocket, tPockets } = createFixture({ orientation, pocketCount: 1 }, radius)
      const expected: Record<PocketOrientationSchema, number[]> = {
        up: [93, 89],
        right: [97, 93],
        down: [95, 97],
        left: [89, 95],
      }
      for (const [index, side] of (['start', 'end'] as const).entries()) {
        expect(
          getSlantedPocketOpeningLimits(
            { ...opening, side },
            cluster,
            frontPocket,
            tPockets,
          ).offset?.max?.value.toNumber(),
        ).toBe(expected[orientation][index])
      }
    },
  )

  it('returns zero instead of a negative maximum and does not mutate inputs', () => {
    const { cluster, frontPocket, tPockets } = createFixture({ pocketStep: 100 / 3 })
    const snapshot = JSON.stringify({ opening, cluster, frontPocket, tPockets })
    expect(
      getSlantedPocketOpeningLimits(opening, cluster, frontPocket, tPockets).offset?.max?.value.toNumber(),
    ).toBeCloseTo(0, 10)
    expect(JSON.stringify({ opening, cluster, frontPocket, tPockets })).toBe(snapshot)
    expect(
      getSlantedPocketOpeningLimits(
        opening,
        cluster,
        { ...frontPocket, boundingRect: { ...frontPocket.boundingRect, width: new BigNumber(0) } },
        tPockets,
      ).offset?.max?.value.toNumber(),
    ).toBe(0)
  })
})
