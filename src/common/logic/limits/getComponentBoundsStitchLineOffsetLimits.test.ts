import BigNumber from 'bignumber.js'
import { describe, expect, it } from 'vitest'
import { POSITION_EPSILON, ZERO_CORNER_RADIUS } from '../../constants/layout'
import { defaultComponentBoundsStitchLine, defaultStitchingSettings } from '../../defaultStates'
import type { ResolvedComponentBoundsStitchLineSchema } from '../../schemas/stitching'
import { getComponentBoundsStitchLineGeometry } from '../stitching/getComponentBoundsStitchLineGeometry'
import { getComponentBoundsStitchLineOffsetLimits } from './getComponentBoundsStitchLineOffsetLimits'

const limits = (overrides: Partial<ResolvedComponentBoundsStitchLineSchema> = {}) => {
  const stitchLine: ResolvedComponentBoundsStitchLineSchema = {
    ...defaultStitchingSettings,
    ...defaultComponentBoundsStitchLine,
    id: 'stitch',
    name: 'Stitch',
    type: 'component-bounds-stitch-line',
    targetId: 'root',
    targetType: 'component',
    top: true,
    right: false,
    bottom: false,
    left: false,
    topLeftCorner: false,
    topRightCorner: false,
    bottomLeftCorner: false,
    bottomRightCorner: false,
    stitchMargin: 0,
    ...overrides,
  }
  const geometry = getComponentBoundsStitchLineGeometry(stitchLine, {
    componentId: 'root',
    cornerRadius: ZERO_CORNER_RADIUS,
    boundingRect: { x: new BigNumber(0), y: new BigNumber(0), width: new BigNumber(100), height: new BigNumber(80) },
  })
  return getComponentBoundsStitchLineOffsetLimits(stitchLine, geometry)
}

describe('component bounds offset limits', () => {
  it('leaves a positive side length and shares compression between both endpoints', () => {
    expect(limits().startOffset?.min?.value.toNumber()).toBeCloseTo(-100 + POSITION_EPSILON, 12)
    expect(limits({ endOffset: -1000 }).startOffset?.min?.value.toNumber()).toBeCloseTo(
      (-100 + POSITION_EPSILON) / 2,
      12,
    )
    expect(limits({ startOffset: -1000 }).endOffset?.min?.value.toNumber()).toBeCloseTo(
      (-100 + POSITION_EPSILON) / 2,
      12,
    )
    expect(limits({ endOffset: -20 }).startOffset?.min?.value.toNumber()).toBeCloseTo(-80 + POSITION_EPSILON, 12)
  })

  it('limits corner endpoints as well, but leaves closed boundaries unchanged', () => {
    expect(limits({ topLeftCorner: true }).startOffset?.min?.value.toNumber()).toBeCloseTo(-100 + POSITION_EPSILON, 12)
    expect(limits({ topLeftCorner: true }).endOffset).toBeDefined()
    expect(
      limits({
        right: true,
        bottom: true,
        left: true,
        topLeftCorner: true,
        topRightCorner: true,
        bottomLeftCorner: true,
        bottomRightCorner: true,
      }),
    ).toEqual({ type: 'component-bounds-stitch-line' })
  })

  it('shares the full route length across endpoint sides', () => {
    const result = limits({ right: true, topRightCorner: true, endOffset: -1000 })
    expect(result.startOffset?.min?.value.toNumber()).toBeCloseTo((-180 + POSITION_EPSILON) / 2, 12)
    expect(result.endOffset?.min?.value.toNumber()).toBeCloseTo(-180 + POSITION_EPSILON, 12)
  })

  it('uses actual rounded-corner arc length in the shared allowance', () => {
    const result = limits({ right: true, topRightCorner: true, autoCornerRadius: false, topRightRadius: 10 })
    const length = 90 + 5 * Math.PI + 70
    expect(result.startOffset?.min?.value.toNumber()).toBeCloseTo(-length + POSITION_EPSILON, 10)
    expect(result.endOffset?.min?.value.toNumber()).toBeCloseTo(-length + POSITION_EPSILON, 10)
  })

  it('allows consuming the opposite positive extension', () => {
    expect(limits({ endOffset: 30 }).startOffset?.min?.value.toNumber()).toBeCloseTo(-130 + POSITION_EPSILON, 12)
    expect(limits({ startOffset: 30 }).endOffset?.min?.value.toNumber()).toBeCloseTo(-130 + POSITION_EPSILON, 12)
  })

  it('clamps negative offsets to zero for an isolated sharp corner', () => {
    const result = limits({ top: false, topRightCorner: true, startOffset: -10, endOffset: -20 })
    expect(result.startOffset?.min?.value.isZero()).toBe(true)
    expect(result.endOffset?.min?.value.isZero()).toBe(true)
    expect(result.startOffset?.min?.reason).toBe('stitch-offset-exceeds-route-length')
    expect(result.startOffset?.min?.severity).toBe('warning')
    const extended = limits({ top: false, topRightCorner: true, endOffset: 20 })
    expect(extended.startOffset?.min?.value.toNumber()).toBeCloseTo(-20 + POSITION_EPSILON, 12)
  })
})
