import BigNumber from 'bignumber.js'
import { describe, expect, it } from 'vitest'

import { POSITION_EPSILON } from '../constants/layout'
import type { PocketOrientationSchema } from '../schemas/components'
import type { RectSchema } from '../schemas/geometry'
import { d } from '../testData'
import { normalizePocketCluster } from './normalizePocketCluster'
import { calculatePocketDepth } from './pocketUtils'

describe.each<PocketOrientationSchema>(['up', 'down', 'left', 'right'])('normalizePocketCluster: %s', (orientation) => {
  const vertical = orientation === 'up' || orientation === 'down'
  const bounds: RectSchema = {
    x: new BigNumber(11),
    y: new BigNumber(17),
    width: new BigNumber(120),
    height: new BigNumber(90),
  }
  const maximumStep = vertical ? 30 : 40
  const maximumSide = vertical ? 60 : 45

  it('preserves values below the limits and leaves the source unchanged', () => {
    const cluster = d.pocketCluster({
      id: 'cluster',
      orientation,
      pocketCount: 3,
      pocketStep: 10,
      tPocketTabWidth: 8,
      tPocketTaper: 20,
      topLeftRadius: 7,
      cardId: 'ID-1-landscape',
      leftStretch: 12,
    })
    const snapshot = structuredClone(cluster)
    expect(normalizePocketCluster(cluster, bounds)).toEqual(cluster)
    expect(cluster).toEqual(snapshot)
  })

  it('keeps values exactly at their maxima', () => {
    const cluster = d.pocketCluster({
      id: 'cluster',
      orientation,
      pocketCount: 3,
      pocketStep: maximumStep,
      tPocketTabWidth: maximumSide,
      tPocketTaper: maximumSide,
    })
    expect(normalizePocketCluster(cluster, bounds)).toEqual(cluster)
  })

  it('corrects only the three bounded parameters when they exceed their limits', () => {
    const cluster = d.pocketCluster({
      id: 'cluster',
      orientation,
      pocketCount: 3,
      pocketStep: 200,
      tPocketTabWidth: 150,
      tPocketTaper: 180,
      openingMapping: { 1: 'own:missing' },
      topLeftRadius: 9,
      rightStretch: 12,
    })
    const snapshot = structuredClone(cluster)
    expect(normalizePocketCluster(cluster, bounds)).toEqual({
      ...cluster,
      pocketStep: maximumStep,
      tPocketTabWidth: maximumSide,
      tPocketTaper: maximumSide,
    })
    expect(cluster).toEqual(snapshot)
  })

  it.each([
    { count: -2, expectedCount: 1 },
    { count: 0, expectedCount: 1 },
    { count: 0.5, expectedCount: 1 },
    { count: 1, expectedCount: 1 },
    { count: 2.9, expectedCount: 2 },
  ])('retains the existing count normalization for $count', ({ count, expectedCount }) => {
    const cluster = d.pocketCluster({ id: 'cluster', orientation, pocketCount: count, pocketStep: 999 })
    const result = normalizePocketCluster(cluster, bounds)
    expect(result.pocketCount).toBe(expectedCount)
    expect(result.pocketStep).toBe((vertical ? 90 : 120) / expectedCount)
  })

  it('retains zero lower bounds for geometric safety', () => {
    const cluster = d.pocketCluster({
      id: 'cluster',
      orientation,
      pocketStep: -10,
      tPocketTabWidth: -20,
      tPocketTaper: -30,
    })
    expect(normalizePocketCluster(cluster, bounds)).toMatchObject({
      pocketStep: 0,
      tPocketTabWidth: 0,
      tPocketTaper: 0,
    })
  })

  it('corrects all three parameters to zero for a zero-size cluster', () => {
    const cluster = d.pocketCluster({ id: 'cluster', orientation })
    expect(normalizePocketCluster(cluster, { ...bounds, width: new BigNumber(0), height: new BigNumber(0) })).toEqual({
      ...cluster,
      pocketStep: 0,
      tPocketTabWidth: 0,
      tPocketTaper: 0,
    })
  })

  it.each([3, 7, 9])('does not make the step larger than the pocket depth with $count pockets', (count) => {
    const cluster = d.pocketCluster({ id: 'cluster', orientation, pocketCount: count, pocketStep: 999 })
    const rect = { ...bounds, width: new BigNumber(100), height: new BigNumber(100) }
    const result = normalizePocketCluster(cluster, rect)
    const depth = calculatePocketDepth(result, rect)
    expect(result.pocketStep).toBeCloseTo(100 / count, 12)
    expect(depth.plus(POSITION_EPSILON).gte(result.pocketStep)).toBe(true)
    expect(depth.gte(0)).toBe(true)
  })
})
