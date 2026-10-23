import BigNumber from 'bignumber.js'
import { describe, expect, it } from 'vitest'
import type { PocketOrientationSchema } from '../schemas/components'
import { d } from '../testData'
import { normalizePocketCluster } from './normalizePocketCluster'
describe.each<PocketOrientationSchema>(['up', 'down', 'left', 'right'])('normalizePocketCluster: %s', (orientation) => {
  const vertical = orientation === 'up' || orientation === 'down'
  const rect = {
    x: new BigNumber(0),
    y: new BigNumber(0),
    width: new BigNumber(vertical ? 100 : 120),
    height: new BigNumber(vertical ? 120 : 100),
  }
  it.each([1, 3, 5])('bounds the step using %i actual children', (count) => {
    const cluster = d.pocketCluster({
      id: 'cluster',
      orientation,
      children: Array.from({ length: count }, (_, index) => String(index)),
      pocketStep: 200,
    })
    const before = structuredClone(cluster)
    expect(normalizePocketCluster(cluster, rect).pocketStep).toBeCloseTo(120 / count, 10)
    expect(cluster).toEqual(before)
  })
  it('preserves a fitting step and handles an empty or zero-size cluster', () => {
    const cluster = d.pocketCluster({ id: 'cluster', orientation, children: ['a', 'b', 'front'], pocketStep: 10 })
    expect(normalizePocketCluster(cluster, rect)).toEqual(cluster)
    expect(normalizePocketCluster({ ...cluster, children: [] }, rect).pocketStep).toBe(0)
    expect(
      normalizePocketCluster(cluster, { ...rect, width: new BigNumber(0), height: new BigNumber(0) }).pocketStep,
    ).toBe(0)
  })
})
