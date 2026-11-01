import BigNumber from 'bignumber.js'
import { describe, expect, it } from 'vitest'
import { ZERO_CORNER_RADIUS } from '../../constants/layout'
import type { PocketOrientationSchema } from '../../schemas/components'
import type { SlantedPocketOpeningSchema } from '../../schemas/pocketOpening'
import { d } from '../../testData'
import { calculatePocketClusterGeometry } from '../calculatePocketClusterGeometry'
import { getSlantedPocketOpeningLimits } from './getSlantedPocketOpeningLimits'

describe.each<PocketOrientationSchema>(['up', 'right', 'down', 'left'])('slanted opening limits: %s', (orientation) => {
  const opening: SlantedPocketOpeningSchema = {
    id: 'opening',
    name: 'Opening',
    type: 'slanted',
    offset: 15,
    side: 'end',
  }
  it('reserves the shoulder of this T-pocket only', () => {
    const source = d.tPocket({ id: 't', openingId: opening.id })
    const cluster = d.pocketCluster({ id: 'cluster', orientation, children: ['t', 'front'], pocketStep: 10 })
    const rect = { x: new BigNumber(11), y: new BigNumber(17), width: new BigNumber(100), height: new BigNumber(100) }
    const pockets = [source, d.frontPocket({ id: 'front' })]
    const computed = calculatePocketClusterGeometry(
      cluster,
      pockets,
      rect,
      ZERO_CORNER_RADIUS,
      d.subProject({ id: 'sub', root: d.rootPanel({ id: 'root' }), components: pockets, pocketOpenings: [opening] }),
    ).children[0]
    const limit = getSlantedPocketOpeningLimits(opening, source, cluster, computed).offset?.max
    expect(limit?.value.toNumber()).toBe(80)
    expect(limit?.reason).toBe('slanted-pocket-opening-offset-exceeds-pocket')
  })
  it.each(['start', 'end'] as const)('uses the selected closed corner for side %s', (side) => {
    const selected = { ...opening, side }
    const source = d.frontPocket({ id: 'front', openingId: selected.id })
    const cluster = d.pocketCluster({ id: 'cluster', orientation, children: ['front'] })
    const rect = { x: new BigNumber(0), y: new BigNumber(0), width: new BigNumber(100), height: new BigNumber(100) }
    const computed = calculatePocketClusterGeometry(
      cluster,
      [source],
      rect,
      ZERO_CORNER_RADIUS,
      d.subProject({ id: 'sub', root: d.rootPanel({ id: 'root' }), pocketOpenings: [selected] }),
    ).children[0]
    const radii = {
      topLeft: new BigNumber(3),
      topRight: new BigNumber(5),
      bottomLeft: new BigNumber(7),
      bottomRight: new BigNumber(11),
    }
    const expected: Record<PocketOrientationSchema, number[]> = {
      up: [93, 89],
      right: [97, 93],
      down: [95, 97],
      left: [89, 95],
    }
    expect(
      getSlantedPocketOpeningLimits(selected, source, cluster, {
        ...computed,
        cornerRadius: radii,
      }).offset?.max?.value.toNumber(),
    ).toBe(expected[orientation][side === 'start' ? 0 : 1])
  })
})
