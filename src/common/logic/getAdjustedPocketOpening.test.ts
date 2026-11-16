import BigNumber from 'bignumber.js'
import { describe, expect, it } from 'vitest'

import type { RecessedPocketOpeningLimitsSchema } from '../schemas/limits'
import type {
  OpticalIllusionPocketOpeningSchema,
  RecessedPocketOpeningSchema,
  SlantedPocketOpeningSchema,
} from '../schemas/pocketOpening'
import { getAdjustedPocketOpening } from './getAdjustedPocketOpening'

const opening: RecessedPocketOpeningSchema = {
  id: 'opening',
  name: 'Opening',
  type: 'recessed',
  recessOuterInset: 5,
  recessInnerOffset: 25,
  recessDepth: 100,
  recessOuterRadius: 60,
  recessInnerRadius: 15,
}
const limits: RecessedPocketOpeningLimitsSchema = {
  type: 'recessed',
  recessOuterInset: {
    min: { value: new BigNumber(10), reason: 'pocket-opening-width', severity: 'warning' },
    max: { value: new BigNumber(30), reason: 'pocket-opening-width', severity: 'warning' },
  },
  recessInnerOffset: { max: { value: new BigNumber(20), reason: 'pocket-opening-width', severity: 'warning' } },
  recessDepth: { max: { value: new BigNumber(79), reason: 'pocket-opening-depth', severity: 'warning' } },
  recessOuterRadius: { max: { value: new BigNumber(50), reason: 'pocket-opening-width', severity: 'warning' } },
}

describe('getAdjustedPocketOpening', () => {
  it('applies the supplied bounds and preserves unbound fields', () => {
    expect(getAdjustedPocketOpening(opening, limits)).toEqual({
      id: 'opening',
      name: 'Opening',
      type: 'recessed',
      recessOuterInset: 10,
      recessInnerOffset: 20,
      recessDepth: 79,
      recessOuterRadius: 50,
      recessInnerRadius: 15,
    })
    expect(opening).toEqual({
      id: 'opening',
      name: 'Opening',
      type: 'recessed',
      recessOuterInset: 5,
      recessInnerOffset: 25,
      recessDepth: 100,
      recessOuterRadius: 60,
      recessInnerRadius: 15,
    })
  })

  it('applies the outer inset maximum without changing the inner radius', () => {
    expect(getAdjustedPocketOpening({ ...opening, recessOuterInset: 90 }, limits)).toEqual({
      id: 'opening',
      name: 'Opening',
      type: 'recessed',
      recessOuterInset: 30,
      recessInnerOffset: 20,
      recessDepth: 79,
      recessOuterRadius: 50,
      recessInnerRadius: 15,
    })
  })

  it('keeps values that already satisfy their bounds', () => {
    const requested: RecessedPocketOpeningSchema = {
      id: 'opening',
      name: 'Opening',
      type: 'recessed',
      recessOuterInset: 20,
      recessInnerOffset: 15,
      recessDepth: 10,
      recessOuterRadius: 5,
      recessInnerRadius: 15,
    }
    expect(getAdjustedPocketOpening(requested, limits)).toEqual(requested)
  })

  it('returns straight openings unchanged', () => {
    const straight = { id: 'opening', name: 'Opening', type: 'straight' } as const
    expect(getAdjustedPocketOpening(straight, { type: 'straight' })).toBe(straight)
  })

  it('returns the original opening when the limit discriminator differs', () => {
    expect(getAdjustedPocketOpening(opening, { type: 'straight' })).toBe(opening)
  })

  it('bounds the slanted offset while preserving side, identity and source values', () => {
    const slanted: SlantedPocketOpeningSchema = {
      id: 'opening',
      name: 'Opening',
      type: 'slanted',
      slantOffset: 90,
      slantSide: 'start',
    }
    const bound = {
      value: new BigNumber(20),
      reason: 'slanted-pocket-opening-offset-exceeds-pocket',
      severity: 'warning',
    } as const
    expect(getAdjustedPocketOpening(slanted, { type: 'slanted', slantOffset: { max: bound } })).toEqual({
      ...slanted,
      slantOffset: 20,
    })
    expect(getAdjustedPocketOpening(slanted, { type: 'slanted' })).toEqual(slanted)
    expect(
      getAdjustedPocketOpening(slanted, {
        type: 'slanted',
        slantOffset: { max: { ...bound, value: new BigNumber(0) } },
      }),
    ).toEqual({ ...slanted, slantOffset: 0 })
    expect(getAdjustedPocketOpening(slanted, { type: 'straight' })).toBe(slanted)
    expect(slanted.slantOffset).toBe(90)
  })
})

it('bounds optical illusion fields without changing its type or requested values', () => {
  const requested: OpticalIllusionPocketOpeningSchema = {
    id: 'opening',
    name: 'Opening',
    type: 'optical-illusion',
    illusionSide: 'start',
    illusionStartInset: 70,
    illusionEndInset: 80,
    illusionLeadingRadius: 99,
    illusionTrailingRadius: 99,
  }
  const bound = {
    value: new BigNumber(50),
    reason: 'optical-illusion-pocket-opening-insets-share-width',
    severity: 'warning',
  } as const
  const snapshot = { ...requested }
  expect(
    getAdjustedPocketOpening(requested, {
      type: 'optical-illusion',
      illusionStartInset: { max: bound },
      illusionEndInset: { max: bound },
      illusionLeadingRadius: { max: { ...bound, value: new BigNumber(4) } },
      illusionTrailingRadius: { max: { ...bound, value: new BigNumber(7) } },
    }),
  ).toEqual({
    ...requested,
    illusionStartInset: 50,
    illusionEndInset: 50,
    illusionLeadingRadius: 4,
    illusionTrailingRadius: 7,
  })
  expect(requested).toEqual(snapshot)
  expect(getAdjustedPocketOpening(requested, { type: 'straight' })).toBe(requested)
})
