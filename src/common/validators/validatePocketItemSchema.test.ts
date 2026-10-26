import { describe, expect, it } from 'vitest'

import { defaultHasPocketItem } from '../defaultStates'
import type { HasPocketItemSchema } from '../schemas/components'
import type { PocketItemIdSchema } from '../schemas/pocketItem'
import type { BaseValidationContextSchema } from '../schemas/validation'
import { EN } from '../translations/en'
import { getEditableSchema } from '../utils/getEditableSchema'
import { validatePocketItemSchema } from './validatePocketItemSchema'

const context: BaseValidationContextSchema = { language: 'en-GB', t: EN.validation }
const current: HasPocketItemSchema = { ...defaultHasPocketItem, itemId: 'ID-1' }
const input = getEditableSchema(current, { language: 'en-GB' })
const ids: (PocketItemIdSchema | undefined)[] = ['ID-2', 'HUF', 'EUR', undefined]

describe('validatePocketItemSchema', () => {
  it.each(ids)('accepts %s and commits independent orientation and offsets', (itemId) => {
    const result = validatePocketItemSchema(
      { ...input, itemId, itemOrientation: 'portrait', itemCrossAxisOffset: '-3', itemOpeningOffset: '7' },
      current,
      context,
    )
    expect(result.isValid).toBe(true)
    expect(result.committedValue).toEqual({
      itemId,
      itemOrientation: 'portrait',
      itemCrossAxisOffset: -3,
      itemOpeningOffset: 7,
    })
  })
  it('rejects an unknown ID and preserves the previous selection', () => {
    const result = validatePocketItemSchema({ ...input, itemId: 'UNKNOWN' as PocketItemIdSchema }, current, context)
    expect(result.isValid).toBe(false)
    expect(result.issues.itemId?.severity).toBe('error')
    expect(result.committedValue.itemId).toBe('ID-1')
  })
  it('rejects a negative opening offset without rejecting a signed cross-axis offset', () => {
    const result = validatePocketItemSchema(
      { ...input, itemId: 'HUF', itemOpeningOffset: '-1', itemCrossAxisOffset: '-2' },
      current,
      context,
    )
    expect(result.isValid).toBe(false)
    expect(result.issues.itemOpeningOffset?.severity).toBe('error')
    expect(result.issues.itemCrossAxisOffset).toBeUndefined()
    expect(result.committedValue.itemOpeningOffset).toBe(0)
    expect(result.committedValue.itemCrossAxisOffset).toBe(-2)
  })
})
