import BigNumber from 'bignumber.js'
import { describe, expect, it } from 'vitest'

import type { RecessedPocketOpeningSchema } from '../schemas/components'
import type { RecessedPocketOpeningLimitsSchema } from '../schemas/limits'
import { getAdjustedPocketOpening } from './getAdjustedPocketOpening'

const opening: RecessedPocketOpeningSchema = {
  id: 'own:test',
  name: 'Test',
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
    min: { value: new BigNumber(10), reason: 'pocket-opening-corner-clearance', severity: 'warning' },
    max: { value: new BigNumber(30), reason: 'pocket-opening-width', severity: 'warning' },
  },
  innerOffset: { max: { value: new BigNumber(20), reason: 'pocket-opening-width', severity: 'warning' } },
  depth: { max: { value: new BigNumber(79), reason: 'pocket-opening-depth', severity: 'warning' } },
  outerRadius: { max: { value: new BigNumber(50), reason: 'pocket-opening-width', severity: 'warning' } },
}

describe('getAdjustedPocketOpening', () => {
  it('applies the supplied bounds and preserves unconstrained fields', () => {
    expect(getAdjustedPocketOpening(opening, limits)).toEqual({
      id: 'own:test',
      name: 'Test',
      type: 'recessed',
      outerInset: 10,
      innerOffset: 20,
      depth: 79,
      outerRadius: 50,
      innerRadius: 15,
    })
    expect(opening).toEqual({
      id: 'own:test',
      name: 'Test',
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
      id: 'own:test',
      name: 'Test',
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
      id: 'own:test',
      name: 'Test',
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
    const straight = { id: 'own:straight', name: 'Straight', type: 'straight' } as const
    expect(getAdjustedPocketOpening(straight, { type: 'straight' })).toBe(straight)
  })

  it('returns the original opening when the limit discriminator differs', () => {
    expect(getAdjustedPocketOpening(opening, { type: 'straight' })).toBe(opening)
  })
})
