import BigNumber from 'bignumber.js'
import { describe, expect, it } from 'vitest'
import type { PocketOrientationSchema } from '../schemas/components'
import type { RectSchema } from '../schemas/geometry'
import type { PocketItemOrientationSchema } from '../schemas/valuables'
import { d } from '../testData'
import { calculatePocketCard } from './calculatePocketCard'

const rect: RectSchema = {
  x: new BigNumber(10),
  y: new BigNumber(20),
  width: new BigNumber(120),
  height: new BigNumber(150),
}
const orientations: PocketOrientationSchema[] = ['up', 'down', 'left', 'right']
const itemOrientations: PocketItemOrientationSchema[] = ['landscape', 'portrait']

describe.each(orientations)('calculatePocketCard: %s opening', (orientation) => {
  it.each(itemOrientations)(
    'positions a %s card relative to the opening and pocket bottom',
    (pocketItemOrientation) => {
      const pocket = d.tPocket({
        id: 'pocket',
        pocketItemId: 'ID-1',
        pocketItemOrientation,
        pocketItemCrossAxisOffset: -3,
        pocketItemOpeningOffset: 7,
      })
      const cluster = d.pocketCluster({ id: 'cluster', orientation })
      const card = calculatePocketCard(pocket, cluster, rect)
      const width = pocketItemOrientation === 'landscape' ? 85.6 : 53.98
      const height = pocketItemOrientation === 'landscape' ? 53.98 : 85.6
      const expectedX =
        orientation === 'left' ? 130 - width - 7 : orientation === 'right' ? 17 : 10 + (120 - width) / 2 - 3
      const expectedY =
        orientation === 'up' ? 170 - height - 7 : orientation === 'down' ? 27 : 20 + (150 - height) / 2 - 3
      expect(card?.card.id).toBe('ID-1')
      expect(card?.boundingRect.width.toNumber()).toBeCloseTo(width)
      expect(card?.boundingRect.height.toNumber()).toBeCloseTo(height)
      expect(card?.boundingRect.x.toNumber()).toBeCloseTo(expectedX)
      expect(card?.boundingRect.y.toNumber()).toBeCloseTo(expectedY)
      expect(card?.path.commands.length).toBeGreaterThan(0)
    },
  )
})

describe('calculatePocketCard', () => {
  it('omits an unselected item', () => {
    expect(
      calculatePocketCard(d.frontPocket({ id: 'pocket' }), d.pocketCluster({ id: 'cluster' }), rect),
    ).toBeUndefined()
  })
  it('applies signed cross-axis offsets and a zero opening offset independently', () => {
    const cluster = d.pocketCluster({ id: 'cluster', orientation: 'up' })
    const pocket = d.frontPocket({ id: 'pocket', pocketItemId: 'ID-2', pocketItemCrossAxisOffset: 4 })
    const card = calculatePocketCard(pocket, cluster, rect)
    expect(card?.boundingRect.x.toNumber()).toBe(21.5)
    expect(card?.boundingRect.y.toNumber()).toBe(96)
  })
})
