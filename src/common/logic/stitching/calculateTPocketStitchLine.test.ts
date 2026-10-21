import BigNumber from 'bignumber.js'
import { describe, expect, it } from 'vitest'

import { ZERO_CORNER_RADIUS } from '../../constants/layout'
import { defaultStitchingSettings } from '../../defaultStates'
import type { PocketOpeningSchema, PocketOrientationSchema } from '../../schemas/components'
import type { ComputedTPocketSchema } from '../../schemas/computed'
import type { ResolvedPocketClusterStitchLineSchema } from '../../schemas/stitching'
import { d } from '../../testData'
import { createPocketCalculator } from '../pockets/createPocketCalculator'
import { calculateTPocketStitchLine } from './calculateTPocketStitchLine'

const createFixture = (opening: PocketOpeningSchema, orientation: PocketOrientationSchema = 'up') => {
  const vertical = orientation === 'up' || orientation === 'down'
  const cluster = d.pocketCluster({
    id: 'cluster',
    orientation,
    pocketStep: 20,
    tPocketTabWidth: 10,
    tPocketTaper: 35,
    defaultOpening: opening,
  })
  const rect = {
    x: new BigNumber(0),
    y: new BigNumber(0),
    width: new BigNumber(vertical ? 100 : 90),
    height: new BigNumber(vertical ? 90 : 100),
  }
  const pocket: ComputedTPocketSchema = {
    id: 'pocket',
    componentId: cluster.id,
    type: 'computed-t-pocket',
    boundingRect: rect,
    cornerRadius: ZERO_CORNER_RADIUS,
    path: createPocketCalculator(cluster, opening, rect, ZERO_CORNER_RADIUS).getTPocketPath(),
  }
  const stitchLine: ResolvedPocketClusterStitchLineSchema = {
    ...defaultStitchingSettings,
    ...d.pocketClusterStitchLine({
      id: 'stitch',
      targetId: cluster.id,
      targetType: 'component',
      stitchMargin: 15,
      startOffset: 0,
      endOffset: 0,
    }),
  }
  return { cluster, pocket, stitchLine }
}

describe('calculateTPocketStitchLine', () => {
  it('intersects the tapered edges at the actual stitch margin', () => {
    const { cluster, pocket, stitchLine } = createFixture({ id: 'own:straight', name: 'Straight', type: 'straight' })
    const result = calculateTPocketStitchLine(stitchLine, cluster, pocket)
    expect(result?.line.start.x.toNumber()).toBeCloseTo(10 + (25 * 55) / 70, 9)
    expect(result?.line.end.x.toNumber()).toBeCloseTo(90 - (25 * 55) / 70, 9)
    expect(result?.line.start.y.toNumber()).toBe(75)
    expect(result?.line.end.y.toNumber()).toBe(75)
  })

  it.each<PocketOrientationSchema>(['up', 'right', 'down', 'left'])(
    'follows slanted shoulders facing %s and retains offset signs',
    (orientation) => {
      const { cluster, pocket, stitchLine } = createFixture(
        { id: 'own:slanted', name: 'Slanted', type: 'slanted', offset: 15, side: 'end' },
        orientation,
      )
      const left = 10 + (25 * (75 - 21.5)) / (90 - 21.5)
      const right = 90 - (25 * (75 - 33.5)) / (90 - 33.5)
      const expected: Record<PocketOrientationSchema, number[]> = {
        up: [left, 75, right, 75],
        right: [15, left, 15, right],
        down: [100 - right, 15, 100 - left, 15],
        left: [75, 100 - right, 75, 100 - left],
      }
      const result = calculateTPocketStitchLine(stitchLine, cluster, pocket)
      const actual = [
        result?.line.start.x.toNumber(),
        result?.line.start.y.toNumber(),
        result?.line.end.x.toNumber(),
        result?.line.end.y.toNumber(),
      ]
      actual.forEach((value, index) => expect(value).toBeCloseTo(expected[orientation][index], 9))
      const offset = calculateTPocketStitchLine({ ...stitchLine, startOffset: 2, endOffset: 3 }, cluster, pocket)
      const axis = orientation === 'up' || orientation === 'down' ? 'x' : 'y'
      expect(offset?.line.start[axis].toNumber()).toBeCloseTo((result?.line.start[axis].toNumber() ?? 0) - 2, 9)
      expect(offset?.line.end[axis].toNumber()).toBeCloseTo((result?.line.end[axis].toNumber() ?? 0) + 3, 9)
    },
  )

  it('mirrors the stitch endpoints with the slanted side', () => {
    const end = createFixture({ id: 'own:slanted', name: 'Slanted', type: 'slanted', offset: 15, side: 'end' })
    const start = createFixture({ ...end.cluster.defaultOpening, type: 'slanted', offset: 15, side: 'start' })
    const first = calculateTPocketStitchLine(end.stitchLine, end.cluster, end.pocket)
    const second = calculateTPocketStitchLine(start.stitchLine, start.cluster, start.pocket)
    expect(second?.line.start.x.toNumber()).toBeCloseTo(100 - (first?.line.end.x.toNumber() ?? 0), 9)
    expect(second?.line.end.x.toNumber()).toBeCloseTo(100 - (first?.line.start.x.toNumber() ?? 0), 9)
  })

  it('handles vertex hits once and skips a missing or collapsed stitch span', () => {
    const { cluster, pocket, stitchLine } = createFixture({ id: 'own:straight', name: 'Straight', type: 'straight' })
    const atBottom = calculateTPocketStitchLine({ ...stitchLine, stitchMargin: 0 }, cluster, pocket)
    expect(atBottom?.line.start.x.toNumber()).toBe(35)
    expect(atBottom?.line.end.x.toNumber()).toBe(65)
    expect(calculateTPocketStitchLine({ ...stitchLine, stitchMargin: 100 }, cluster, pocket)).toBeUndefined()
    const empty = {
      ...pocket,
      path: { commands: [] },
      boundingRect: { ...pocket.boundingRect, width: new BigNumber(0) },
    }
    expect(calculateTPocketStitchLine(stitchLine, cluster, empty)).toBeUndefined()
    const triangle = createFixture({ id: 'own:straight', name: 'Straight', type: 'straight' })
    const pointedCluster = { ...triangle.cluster, tPocketTaper: 50 }
    const pointed = {
      ...triangle.pocket,
      path: createPocketCalculator(
        pointedCluster,
        pointedCluster.defaultOpening,
        triangle.pocket.boundingRect,
        ZERO_CORNER_RADIUS,
      ).getTPocketPath(),
    }
    expect(calculateTPocketStitchLine({ ...stitchLine, stitchMargin: 0 }, pointedCluster, pointed)).toBeUndefined()
  })
})
