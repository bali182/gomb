import { describe, expect, it } from 'vitest'
import { defaultOpticalIllusionPocketOpening } from '../defaultStates'
import type { SlantedPocketOpeningSchema } from '../schemas/components'
import type { BaseValidationContextSchema } from '../schemas/validation'
import { EN } from '../translations/en'
import { getEditableSchema } from '../utils/getEditableSchema'
import { validatePocketOpeningSchema } from './validatePocketOpeningSchema'
const context: BaseValidationContextSchema = { language: 'en-GB', t: EN.validation }
const slanted: SlantedPocketOpeningSchema = { type: 'slanted', offset: 15, side: 'end' }
describe('validatePocketOpeningSchema', () => {
  it('switches between opening types without introducing identity fields', () => {
    const result = validatePocketOpeningSchema(
      getEditableSchema(slanted, { language: 'en-GB' }),
      { type: 'straight' },
      context,
    )
    expect(result.isValid).toBe(true)
    expect(result.value).toEqual(slanted)
  })
  it.each(['0', '-1', '', '-', 'abc'])('rejects invalid offset %s while retaining valid side changes', (offset) => {
    const result = validatePocketOpeningSchema({ type: 'slanted', offset, side: 'start' }, slanted, context)
    expect(result.isValid).toBe(false)
    expect(result.issues).toMatchObject({ offset: { severity: 'error' } })
    expect(result.committedValue).toEqual({ ...slanted, side: 'start' })
  })
  it('rejects an unknown side without losing the previous value', () => {
    const input = getEditableSchema(slanted, { language: 'en-GB' })
    Reflect.set(input, 'side', 'unknown')
    const result = validatePocketOpeningSchema(input, slanted, context)
    expect(result.isValid).toBe(false)
    expect(result.committedValue).toEqual(slanted)
  })
})

describe('optical illusion opening validation', () => {
  it('accepts all zero numeric fields and switching from straight', () => {
    const value = {
      ...defaultOpticalIllusionPocketOpening,
      startInset: 0,
      endInset: 0,
      leadingRadius: 0,
      trailingRadius: 0,
    }
    const result = validatePocketOpeningSchema(
      getEditableSchema(value, { language: 'en-GB' }),
      { type: 'straight' },
      context,
    )
    expect(result.isValid).toBe(true)
    expect(result.value).toEqual(value)
  })
  it.each(['startInset', 'endInset', 'leadingRadius', 'trailingRadius'] as const)(
    'retains %s on invalid input while committing direction',
    (field) => {
      const input = getEditableSchema(defaultOpticalIllusionPocketOpening, { language: 'en-GB' })
      input[field] = '-1'
      input.direction = 'start'
      const result = validatePocketOpeningSchema(input, defaultOpticalIllusionPocketOpening, context)
      expect(result.isValid).toBe(false)
      expect(result.issues).toMatchObject({ [field]: { severity: 'error' } })
      expect(result.committedValue).toEqual({ ...defaultOpticalIllusionPocketOpening, direction: 'start' })
    },
  )
  it('rejects an unknown direction', () => {
    const input = getEditableSchema(defaultOpticalIllusionPocketOpening, { language: 'en-GB' })
    Reflect.set(input, 'direction', 'unknown')
    const result = validatePocketOpeningSchema(input, defaultOpticalIllusionPocketOpening, context)
    expect(result.isValid).toBe(false)
    expect(result.issues).toMatchObject({ direction: { severity: 'error' } })
  })
})
