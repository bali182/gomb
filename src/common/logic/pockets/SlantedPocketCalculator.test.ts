import BigNumber from 'bignumber.js'
import { describe, expect, it } from 'vitest'
import { narrowers } from '../../utils/narrowers'
import type { ArcPathSegment } from '../pathSegmentTypes'

import { ZERO_CORNER_RADIUS } from '../../constants/layout'
import type { PocketOrientationSchema } from '../../schemas/components'
import type { PathSchema, RectSchema } from '../../schemas/geometry'
import type { SlantedPocketOpeningSchema } from '../../schemas/pocketOpening'
import { d } from '../../testData'
import { last } from '../../utils/last'
import { getPathSegments } from '../pathSegments'
import { createPocketCalculator } from './createPocketCalculator'

const opening: SlantedPocketOpeningSchema = { id: 'opening', name: 'Opening', type: 'slanted', offset: 15, side: 'end' }
const rect: RectSchema = {
  x: new BigNumber(11),
  y: new BigNumber(17),
  width: new BigNumber(100),
  height: new BigNumber(90),
}
const points = (path: PathSchema): number[][] =>
  path.commands.flatMap((command) =>
    narrowers.path.is.close(command) ? [] : [[command.point.x.toNumber(), command.point.y.toNumber()]],
  )

describe('SlantedPocketCalculator', () => {
  it.each(['start', 'end'] as const)('keeps previews local and moves only the %s endpoint inward', (side) => {
    const cluster = d.pocketCluster({
      id: 'cluster',
      orientation: 'up',
      pocketStep: 20,
    })
    const selected = { ...opening, side }
    const snapshot = JSON.stringify({ cluster, selected, rect })
    const calculator = createPocketCalculator(
      d.tPocket({ id: 't', tPocketTabWidth: 10, tPocketTaper: 35 }),
      cluster,
      selected,
      rect,
      ZERO_CORNER_RADIUS,
    )
    expect(points(calculator.getPocketOpeningPath())).toEqual(
      side === 'end'
        ? [
            [0, 0],
            [100, 15],
          ]
        : [
            [0, 15],
            [100, 0],
          ],
    )
    expect(points(calculator.getTPocketPath())).toEqual(
      side === 'end'
        ? [
            [11, 17],
            [111, 32],
            [111, 52],
            [101, 50.5],
            [76, 107],
            [46, 107],
            [21, 38.5],
            [11, 37],
          ]
        : [
            [11, 32],
            [111, 17],
            [111, 37],
            [101, 38.5],
            [76, 107],
            [46, 107],
            [21, 50.5],
            [11, 52],
          ],
    )
    expect(last(calculator.getTPocketPath().commands)).toEqual({ type: 'close' })
    expect(last(calculator.getFrontPocketPath().commands)).toEqual({ type: 'close' })
    expect(JSON.stringify({ cluster, selected, rect })).toBe(snapshot)
  })

  it.each<PocketOrientationSchema>(['up', 'right', 'down', 'left'])(
    'positions complete paths facing %s and preserves closed corner arcs',
    (orientation) => {
      const vertical = orientation === 'up' || orientation === 'down'
      const pocketRect = {
        ...rect,
        width: new BigNumber(vertical ? 100 : 90),
        height: new BigNumber(vertical ? 90 : 100),
      }
      const cluster = d.pocketCluster({
        id: 'cluster',
        orientation,
        pocketStep: 20,
      })
      const radius = new BigNumber(5)
      const calculator = createPocketCalculator(
        d.tPocket({ id: 't', tPocketTabWidth: 10, tPocketTaper: 35 }),
        cluster,
        opening,
        pocketRect,
        {
          topLeft: radius,
          topRight: radius,
          bottomLeft: radius,
          bottomRight: radius,
        },
      )
      const expected: Record<PocketOrientationSchema, number[][]> = {
        up: [
          [11, 17],
          [111, 32],
        ],
        right: [
          [101, 17],
          [86, 117],
        ],
        down: [
          [111, 107],
          [11, 92],
        ],
        left: [
          [11, 117],
          [26, 17],
        ],
      }
      expect(points(calculator.getFrontPocketPath()).slice(0, 2)).toEqual(expected[orientation])
      expect(points(calculator.getTPocketPath()).slice(0, 2)).toEqual(expected[orientation])
      expect(points(calculator.getPocketOpeningPath())).toEqual([
        [0, 0],
        [100, 15],
      ])
      const arcs = getPathSegments(calculator.getFrontPocketPath()).filter((segment): segment is ArcPathSegment =>
        narrowers.path.is.arcSegment(segment),
      )
      expect(arcs.map((arc) => arc.radius.toNumber())).toEqual([5, 5])
      for (const path of [calculator.getFrontPocketPath(), calculator.getTPocketPath()]) {
        for (const [x, y] of points(path)) {
          expect(x).toBeGreaterThanOrEqual(11)
          expect(x).toBeLessThanOrEqual(11 + pocketRect.width.toNumber())
          expect(y).toBeGreaterThanOrEqual(17)
          expect(y).toBeLessThanOrEqual(17 + pocketRect.height.toNumber())
        }
      }
    },
  )

  it('keeps zero-width and zero-offset corrected openings finite', () => {
    const cluster = d.pocketCluster({ id: 'cluster', pocketStep: 0 })
    const calculator = createPocketCalculator(
      d.tPocket({ id: 't', tPocketTabWidth: 0, tPocketTaper: 0 }),
      cluster,
      { ...opening, offset: 0 },
      { ...rect, width: new BigNumber(0) },
      ZERO_CORNER_RADIUS,
    )
    expect(points(calculator.getPocketOpeningPath())).toEqual([
      [0, 0],
      [0, 0],
    ])
    for (const path of [calculator.getFrontPocketPath(), calculator.getTPocketPath()]) {
      expect(points(path).flat().every(Number.isFinite)).toBe(true)
    }
  })
})
