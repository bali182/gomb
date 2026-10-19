import BigNumber from 'bignumber.js'
import { describe, expect, it } from 'vitest'

import type { PocketOrientationSchema } from '../../schemas/components'
import type { RectSchema } from '../../schemas/geometry'
import { d } from '../../testData'
import { getPocketsLimits } from './getPocketsLimits'

describe.each<PocketOrientationSchema>(['up', 'down', 'left', 'right'])('getPocketsLimits: %s', (orientation) => {
  const vertical = orientation === 'up' || orientation === 'down'
  const bounds: RectSchema = {
    x: new BigNumber(11),
    y: new BigNumber(17),
    width: new BigNumber(120),
    height: new BigNumber(90),
  }

  it.each([
    { count: 1, verticalMaximum: 90, horizontalMaximum: 120 },
    { count: 2, verticalMaximum: 45, horizontalMaximum: 60 },
    { count: 3, verticalMaximum: 30, horizontalMaximum: 40 },
    { count: 8, verticalMaximum: 11.25, horizontalMaximum: 15 },
  ])('limits the spacing of $count pockets', ({ count, verticalMaximum, horizontalMaximum }) => {
    const cluster = d.pocketCluster({ id: 'cluster', orientation, pocketCount: count })
    const limits = getPocketsLimits(cluster, bounds)
    expect(limits.pocketStep?.max).toEqual({
      value: new BigNumber(vertical ? verticalMaximum : horizontalMaximum),
      reason: 'cluster-size-and-pocket-count',
      severity: 'warning',
    })
    expect(limits.pocketStep?.min).toBeUndefined()
    expect(limits.pocketCount).toBeUndefined()
  })

  it('gives tab width and taper distinct reasons for the same half-width maximum', () => {
    const cluster = d.pocketCluster({ id: 'cluster', orientation })
    const limits = getPocketsLimits(cluster, bounds)
    const value = new BigNumber(vertical ? 60 : 45)
    expect(limits.tPocketTabWidth?.max).toEqual({
      value,
      reason: 't-pocket-tab-width-exceeds-half-width',
      severity: 'warning',
    })
    expect(limits.tPocketTaper?.max).toEqual({
      value,
      reason: 't-pocket-taper-exceeds-half-width',
      severity: 'warning',
    })
    expect(limits.tPocketTabWidth?.min).toBeUndefined()
    expect(limits.tPocketTaper?.min).toBeUndefined()
  })

  it('preserves fractional limits and does not mutate source parameters or geometry', () => {
    const cluster = d.pocketCluster({
      id: 'cluster',
      orientation,
      pocketCount: 3,
      pocketStep: 80,
      tPocketTabWidth: 70,
      tPocketTaper: 90,
    })
    const snapshot = structuredClone(cluster)
    const rect: RectSchema = { ...bounds, width: new BigNumber(100), height: new BigNumber(100) }
    const limits = getPocketsLimits(cluster, rect)
    expect(limits.pocketStep?.max?.value.eq(new BigNumber(100).dividedBy(3))).toBe(true)
    expect(limits.tPocketTabWidth?.max?.value.toNumber()).toBe(50)
    expect(cluster).toEqual(snapshot)
    expect(rect).toEqual({ ...bounds, width: new BigNumber(100), height: new BigNumber(100) })
  })

  it.each([
    { width: 0, height: 0, verticalStep: 0, horizontalStep: 0, verticalSide: 0, horizontalSide: 0 },
    { width: 0, height: 90, verticalStep: 30, horizontalStep: 0, verticalSide: 0, horizontalSide: 45 },
    { width: 120, height: 0, verticalStep: 0, horizontalStep: 40, verticalSide: 60, horizontalSide: 0 },
    { width: 0.6, height: 0.9, verticalStep: 0.3, horizontalStep: 0.2, verticalSide: 0.3, horizontalSide: 0.45 },
  ])(
    'handles a $width by $height cluster',
    ({ width, height, verticalStep, horizontalStep, verticalSide, horizontalSide }) => {
      const cluster = d.pocketCluster({ id: 'cluster', orientation, pocketCount: 3 })
      const limits = getPocketsLimits(cluster, {
        ...bounds,
        width: new BigNumber(width),
        height: new BigNumber(height),
      })
      expect(limits.pocketStep?.max?.value.toNumber()).toBe(vertical ? verticalStep : horizontalStep)
      expect(limits.tPocketTabWidth?.max?.value.toNumber()).toBe(vertical ? verticalSide : horizontalSide)
      expect(limits.tPocketTaper?.max?.value.toNumber()).toBe(vertical ? verticalSide : horizontalSide)
    },
  )
})
