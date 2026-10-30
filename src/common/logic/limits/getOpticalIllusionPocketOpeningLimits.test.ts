import BigNumber from 'bignumber.js'
import { describe, expect, it } from 'vitest'
import { narrowers } from '../../utils/narrowers'

import { ZERO_CORNER_RADIUS } from '../../constants/layout'
import { defaultOpticalIllusionPocketOpening } from '../../defaultStates'
import type { OpticalIllusionPocketOpeningSchema } from '../../schemas/components'
import type { ComputedTPocketSchema } from '../../schemas/computed'
import { d } from '../../testData'
import { getAdjustedPocketOpening } from '../getAdjustedPocketOpening'
import { getPathSegments } from '../pathSegments'
import { OpticalIllusionPocketCalculator } from '../pockets/OpticalIllusionPocketCalculator'
import { getOpticalIllusionPocketOpeningLimits } from './getOpticalIllusionPocketOpeningLimits'

const pocket = d.tPocket({ id: 't' })
const cluster = d.pocketCluster({ id: 'cluster', children: ['t'], pocketStep: 20 })
const computed: ComputedTPocketSchema = {
  type: 'computed-t-pocket',
  componentId: 't',
  children: [],
  path: { commands: [] },
  boundingRect: { x: new BigNumber(0), y: new BigNumber(0), width: new BigNumber(100), height: new BigNumber(80) },
  cornerRadius: ZERO_CORNER_RADIUS,
}
const getLimits = (fields: Partial<OpticalIllusionPocketOpeningSchema> = {}) => {
  const opening = { ...defaultOpticalIllusionPocketOpening, ...fields }
  const limits = getOpticalIllusionPocketOpeningLimits(opening, pocket, cluster, computed)
  return { opening, limits, adjusted: getAdjustedPocketOpening(opening, limits) }
}

describe('getOpticalIllusionPocketOpeningLimits', () => {
  it.each([
    [70, 20, 70, 20],
    [70, 40, 60, 40],
    [40, 70, 40, 60],
    [70, 80, 50, 50],
    [0, 100, 0, 100],
  ])('shares width for inset pair %s / %s', (startInset, endInset, start, end) => {
    const { opening, adjusted } = getLimits({ startInset, endInset })
    expect(adjusted).toMatchObject({ startInset: start, endInset: end })
    expect(opening).toMatchObject({ startInset, endInset })
  })

  it('limits R at a 45-degree corner using its 2 mm leading section', () => {
    const { limits } = getLimits({ startInset: 2, endInset: 78, leadingRadius: 10 })
    expect(limits.leadingRadius?.max?.value.toNumber()).toBeCloseTo(2 / Math.tan(Math.PI / 8), 10)
    expect(limits.leadingRadius?.max?.reason).toBe('optical-illusion-pocket-opening-radius-exceeds-leading-length')
  })

  it('shares the diagonal by halves when both requested radii exceed half its length', () => {
    const { limits, adjusted } = getLimits({ startInset: 40, endInset: 40, leadingRadius: 100, trailingRadius: 100 })
    const expected = Math.hypot(20, 20) / 2 / Math.tan(Math.PI / 8)
    expect(limits.leadingRadius?.max?.value.toNumber()).toBeCloseTo(expected, 10)
    expect(limits.trailingRadius?.max?.value.toNumber()).toBeCloseTo(expected, 10)
    expect(limits.leadingRadius?.max?.reason).toBe('optical-illusion-pocket-opening-radii-share-slanted-length')
    if (!narrowers.is.opticalIllusionPocketOpening(adjusted)) throw new Error('Wrong opening')
    const path = new OpticalIllusionPocketCalculator(
      pocket,
      cluster,
      adjusted,
      computed.boundingRect,
      ZERO_CORNER_RADIUS,
    ).getPocketOpeningPath()
    const segments = getPathSegments(path)
    expect(segments.filter(narrowers.path.is.arcSegment)).toHaveLength(2)
    expect(
      segments.some((segment) => narrowers.path.is.lineSegment(segment) && !segment.start.y.eq(segment.end.y)),
    ).toBe(false)
  })

  it('preserves the smaller rounding when only the other one must yield', () => {
    const { limits } = getLimits({ startInset: 40, endInset: 40, leadingRadius: 100, trailingRadius: 5 })
    const expected = Math.hypot(20, 20) / Math.tan(Math.PI / 8) - 5
    expect(limits.leadingRadius?.max?.value.toNumber()).toBeCloseTo(expected, 10)
  })

  it('disables the corresponding radius when a straight section vanishes', () => {
    const { adjusted } = getLimits({ startInset: 0, endInset: 0, leadingRadius: 20, trailingRadius: 20 })
    expect(adjusted).toMatchObject({ leadingRadius: 0, trailingRadius: 0 })
  })
})
