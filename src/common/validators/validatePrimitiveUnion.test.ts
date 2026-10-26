import { describe, expect, it } from 'vitest'

import { pocketItems } from '../data/pocketItems'
import type { BaseValidationContextSchema } from '../schemas/validation'
import { EN } from '../translations/en'
import { validatePrimitiveUnion } from './validatePrimitiveUnion'

const context: BaseValidationContextSchema = { language: 'en-GB', t: EN.validation }

describe('validatePrimitiveUnion record values', () => {
  it('accepts existing boolean records based on their own keys', () => {
    const allowed = { first: true, second: false }
    expect(validatePrimitiveUnion('second', 'first', allowed, context).committedValue).toBe('second')
  })
  it('accepts object-valued catalog records', () => {
    const result = validatePrimitiveUnion('HUF', 'ID-1', pocketItems, context)
    expect(result.isValid).toBe(true)
    expect(result.committedValue).toBe('HUF')
  })
  it.each(['unknown', 'toString'])('rejects %s without changing the committed value', (value) => {
    const result = validatePrimitiveUnion(value, 'ID-1', pocketItems, context)
    expect(result.isValid).toBe(false)
    expect(result.committedValue).toBe('ID-1')
  })
  it('allows clearing an optional value', () => {
    const result = validatePrimitiveUnion(undefined, 'ID-1', pocketItems, context, true)
    expect(result.isValid).toBe(true)
    expect(result.committedValue).toBeUndefined()
  })
  it('rejects a missing required value', () => {
    const result = validatePrimitiveUnion(undefined, 'ID-1', pocketItems, context)
    expect(result.isValid).toBe(false)
    expect(result.committedValue).toBe('ID-1')
  })
})
