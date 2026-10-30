import BigNumber from 'bignumber.js'
import { describe, expect, it } from 'vitest'
import { narrowers } from '../utils/narrowers'

import type { PocketOrientationSchema } from '../schemas/components'
import type { RectSchema } from '../schemas/geometry'
import type { PocketItemIdSchema, PocketItemOrientationSchema } from '../schemas/pocketItem'
import { d } from '../testData'
import { calculatePocketItem } from './calculatePocketItem'

const rect: RectSchema = {
  x: new BigNumber(10),
  y: new BigNumber(20),
  width: new BigNumber(120),
  height: new BigNumber(150),
}
const orientations: PocketOrientationSchema[] = ['up', 'down', 'left', 'right']
const itemOrientations: PocketItemOrientationSchema[] = ['landscape', 'portrait']

type PocketItemCaseSchema = { id: PocketItemIdSchema; width: number; height: number; radius: number }
const items: PocketItemCaseSchema[] = [
  { id: 'ID-1', width: 85.6, height: 53.98, radius: 3.18 },
  { id: 'HUF', width: 154, height: 70, radius: 0 },
]

describe.each(items)('calculatePocketItem: $id', ({ id, width, height, radius }) => {
  describe.each(['t-pocket', 'front-pocket'] as const)('%s', (pocketType) => {
    describe.each(orientations)('%s opening', (orientation) => {
      it.each(itemOrientations)('positions a %s item and builds its outline', (itemOrientation) => {
        const fields = { id: 'pocket', itemId: id, itemOrientation, itemCrossAxisOffset: -3, itemOpeningOffset: 7 }
        const pocket = pocketType === 't-pocket' ? d.tPocket(fields) : d.frontPocket(fields)
        const item = calculatePocketItem(pocket, d.pocketCluster({ id: 'cluster', orientation }), rect)
        const expectedWidth = itemOrientation === 'landscape' ? width : height
        const expectedHeight = itemOrientation === 'landscape' ? height : width
        const centerX = 10 + (120 - expectedWidth) / 2 - 3
        const centerY = 20 + (150 - expectedHeight) / 2 - 3
        const positions: Record<PocketOrientationSchema, { x: number; y: number }> = {
          up: { x: centerX, y: 170 - expectedHeight - 7 },
          down: { x: centerX, y: 27 },
          left: { x: 130 - expectedWidth - 7, y: centerY },
          right: { x: 17, y: centerY },
        }
        expect(item?.item.id).toBe(id)
        expect(item?.boundingRect.width.toNumber()).toBeCloseTo(expectedWidth)
        expect(item?.boundingRect.height.toNumber()).toBeCloseTo(expectedHeight)
        expect(item?.boundingRect.x.toNumber()).toBeCloseTo(positions[orientation].x)
        expect(item?.boundingRect.y.toNumber()).toBeCloseTo(positions[orientation].y)
        expect(Object.values(item!.cornerRadius).map((value) => value.toNumber())).toEqual([
          radius,
          radius,
          radius,
          radius,
        ])
        expect(item?.path.commands.filter((command) => narrowers.path.is.arcTo(command))).toHaveLength(
          radius === 0 ? 0 : 4,
        )
      })
    })
  })
})

describe('calculatePocketItem', () => {
  it('omits an unselected item', () => {
    expect(
      calculatePocketItem(d.frontPocket({ id: 'pocket' }), d.pocketCluster({ id: 'cluster' }), rect),
    ).toBeUndefined()
  })
  it.each([-4, 0, 4])(
    'applies a %s cross-axis offset independently of a zero opening offset',
    (itemCrossAxisOffset) => {
      const pocket = d.frontPocket({ id: 'pocket', itemId: 'ID-2', itemCrossAxisOffset })
      const item = calculatePocketItem(pocket, d.pocketCluster({ id: 'cluster', orientation: 'up' }), rect)
      expect(item?.boundingRect.x.toNumber()).toBe(17.5 + itemCrossAxisOffset)
      expect(item?.boundingRect.y.toNumber()).toBe(96)
    },
  )
  it('rejects an unknown catalog ID', () => {
    const pocket = d.frontPocket({ id: 'pocket', itemId: 'unknown' as PocketItemIdSchema })
    expect(() => calculatePocketItem(pocket, d.pocketCluster({ id: 'cluster' }), rect)).toThrow('Pocket item not found')
  })
})
