import BigNumber from 'bignumber.js'
import { describe, expect, it } from 'vitest'
import type { PocketOrientationSchema } from '../../schemas/components'
import { d } from '../../testData'
import { getPocketsLimits } from './getPocketsLimits'
describe.each<PocketOrientationSchema>(['up', 'right', 'down', 'left'])('getPocketsLimits: %s', (orientation) => {
  it.each([0, 1, 3, 8])('uses %i child references without changing source data', (count) => {
    const cluster = d.pocketCluster({
      id: 'cluster',
      orientation,
      children: Array.from({ length: count }, (_, index) => String(index)),
    })
    const snapshot = structuredClone(cluster)
    const vertical = orientation === 'up' || orientation === 'down'
    const rect = {
      x: new BigNumber(11),
      y: new BigNumber(17),
      width: new BigNumber(vertical ? 100 : 120),
      height: new BigNumber(vertical ? 120 : 100),
    }
    const bound = getPocketsLimits(cluster, rect).pocketStep?.max
    expect(bound?.value.toNumber()).toBeCloseTo(count === 0 ? 0 : 120 / count, 10)
    expect(bound?.reason).toBe('cluster-size-and-pocket-count')
    expect(cluster).toEqual(snapshot)
  })
})
