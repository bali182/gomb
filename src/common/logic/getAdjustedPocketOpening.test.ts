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
  outerInset: 5,
  innerOffset: 25,
  depth: 100,
  outerRadius: 60,
  innerRadius: 15,
}
const limits: RecessedPocketOpeningLimitsSchema = {
  type: 'recessed',
  outerInset: {
    min: { value: new BigNumber(10), reason: 'pocket-opening-width', severity: 'warning' },
    max: { value: new BigNumber(30), reason: 'pocket-opening-width', severity: 'warning' },
  },
  innerOffset: { max: { value: new BigNumber(20), reason: 'pocket-opening-width', severity: 'warning' } },
  depth: { max: { value: new BigNumber(79), reason: 'pocket-opening-depth', severity: 'warning' } },
  outerRadius: { max: { value: new BigNumber(50), reason: 'pocket-opening-width', severity: 'warning' } },
}

describe('getAdjustedPocketOpening', () => {
  it('applies the supplied bounds and preserves unconstrained fields', () => {
    expect(getAdjustedPocketOpening(opening, limits)).toEqual({
      id: 'opening',
      name: 'Opening',
      type: 'recessed',
      outerInset: 10,
      innerOffset: 20,
      depth: 79,
      outerRadius: 50,
      innerRadius: 15,
    })
    expect(opening).toEqual({
      id: 'opening',
      name: 'Opening',
      type: 'recessed',
      outerInset: 5,
      innerOffset: 25,
      depth: 100,
      outerRadius: 60,
      innerRadius: 15,
    })
  })

  it('applies the outer inset maximum without changing the inner radius', () => {
    expect(getAdjustedPocketOpening({ ...opening, outerInset: 90 }, limits)).toEqual({
      id: 'opening',
      name: 'Opening',
      type: 'recessed',
      outerInset: 30,
      innerOffset: 20,
      depth: 79,
      outerRadius: 50,
      innerRadius: 15,
    })
  })

  it('keeps values that already satisfy their bounds', () => {
    const requested: RecessedPocketOpeningSchema = {
      id: 'opening',
      name: 'Opening',
      type: 'recessed',
      outerInset: 20,
      innerOffset: 15,
      depth: 10,
      outerRadius: 5,
      innerRadius: 15,
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
      offset: 90,
      side: 'start',
    }
    const bound = {
      value: new BigNumber(20),
      reason: 'slanted-pocket-opening-offset-exceeds-pocket',
      severity: 'warning',
    } as const
    expect(getAdjustedPocketOpening(slanted, { type: 'slanted', offset: { max: bound } })).toEqual({
      ...slanted,
      offset: 20,
    })
    expect(getAdjustedPocketOpening(slanted, { type: 'slanted' })).toEqual(slanted)
    expect(
      getAdjustedPocketOpening(slanted, { type: 'slanted', offset: { max: { ...bound, value: new BigNumber(0) } } }),
    ).toEqual({ ...slanted, offset: 0 })
    expect(getAdjustedPocketOpening(slanted, { type: 'straight' })).toBe(slanted)
    expect(slanted.offset).toBe(90)
  })
})

it('bounds optical illusion fields without changing its type or requested values', () => {
  const requested: OpticalIllusionPocketOpeningSchema = {
    id: 'opening',
    name: 'Opening',
    type: 'optical-illusion',
    direction: 'start',
    startInset: 70,
    endInset: 80,
    leadingRadius: 99,
    trailingRadius: 99,
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
      startInset: { max: bound },
      endInset: { max: bound },
      leadingRadius: { max: { ...bound, value: new BigNumber(4) } },
      trailingRadius: { max: { ...bound, value: new BigNumber(7) } },
    }),
  ).toEqual({ ...requested, startInset: 50, endInset: 50, leadingRadius: 4, trailingRadius: 7 })
  expect(requested).toEqual(snapshot)
  expect(getAdjustedPocketOpening(requested, { type: 'straight' })).toBe(requested)
})
