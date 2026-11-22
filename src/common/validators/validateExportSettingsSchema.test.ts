import { describe, expect, it } from 'vitest'
import { defaultExportParams } from '../defaultStates'
import type { EditableSchema } from '../schemas/editable'
import type { ExportSettingsSchema } from '../schemas/settings'
import type { BaseValidationContextSchema } from '../schemas/validation'
import { EN } from '../translations/en'
import { getEditableSchema } from '../utils/getEditableSchema'
import { validateExportSettingsSchema } from './validateExportSettingsSchema'

const context: BaseValidationContextSchema = { language: 'en-GB', t: EN.validation }
const current: ExportSettingsSchema = { ...defaultExportParams, page: 'A4', padding: 10, cutHelperDistance: 0 }
const validate = (changes: Partial<EditableSchema<ExportSettingsSchema>>) =>
  validateExportSettingsSchema({ ...getEditableSchema(current, context), ...changes }, current, context)

describe('export layout settings', () => {
  it.each(['stacked', 'compact'] as const)('accepts the %s layout', (layout) => {
    const result = validate({ layout })
    expect(result.isValid).toBe(true)
    expect(result.committedValue.layout).toBe(layout)
  })

  it.each(['vertical', 'horizontal'])('rejects the removed %s layout', (layout) => {
    const input = getEditableSchema(current, context)
    Reflect.set(input, 'layout', layout)
    const result = validateExportSettingsSchema(input, current, context)
    expect(result.isValid).toBe(false)
    expect(result.issues.layout?.severity).toBe('error')
    expect(result.committedValue.layout).toBe(current.layout)
  })
})

describe('export settings page limits', () => {
  it.each(['105', '106', '1000'])('rejects padding %s that consumes the short page dimension', (padding) => {
    const result = validate({ padding })
    expect(result.isValid).toBe(false)
    expect(result.issues.padding?.severity).toBe('error')
    expect(result.committedValue.padding).toBe(current.padding)
  })

  it('allows positive remaining space immediately below the padding limit', () => {
    expect(validate({ padding: '104.99' }).isValid).toBe(true)
  })

  it('combines padding and the cut helper when determining their available space', () => {
    const invalid = validate({ padding: '100', cutHelperDistance: '5' })
    expect(invalid.isValid).toBe(false)
    expect(invalid.issues.cutHelperDistance?.severity).toBe('error')
    expect(invalid.committedValue.padding + invalid.committedValue.cutHelperDistance).toBeLessThan(105)
    expect(validate({ padding: '100', cutHelperDistance: '4.99' }).isValid).toBe(true)
  })

  it('uses the selected paper size and is independent of paper orientation', () => {
    expect(validate({ page: 'A5', padding: '74' }).isValid).toBe(false)
    expect(validate({ page: 'A5', orientation: 'landscape', padding: '74' }).isValid).toBe(false)
    expect(validate({ page: 'A3', padding: '110' }).isValid).toBe(true)
  })

  it('preserves a valid settings combination when changing paper invalidates the previous padding', () => {
    const previous: ExportSettingsSchema = { ...current, page: 'A3', padding: 110 }
    const input = { ...getEditableSchema(previous, context), page: current.page }
    const result = validateExportSettingsSchema(input, previous, context)
    expect(result.isValid).toBe(false)
    expect(result.committedValue).toEqual(previous)
    expect(result.issues.cutHelperDistance).toBeUndefined()
  })

  it('keeps a valid combination when the padding grows beyond the previous cut helper allowance', () => {
    const previous: ExportSettingsSchema = { ...current, padding: 10, cutHelperDistance: 20 }
    const input = { ...getEditableSchema(previous, context), padding: '100' }
    const result = validateExportSettingsSchema(input, previous, context)
    expect(result.isValid).toBe(false)
    expect(result.committedValue).toEqual(previous)
  })

  it('accepts a gap larger than the paper and still rejects negative gaps', () => {
    expect(validate({ gap: '10000' }).isValid).toBe(true)
    expect(validate({ gap: '-1' }).isValid).toBe(false)
  })
})

describe('pageless export settings', () => {
  it.each([false, true])('preserves the pageless setting %s', (pageless) => {
    const result = validate({ pageless })
    expect(result.isValid).toBe(true)
    expect(result.committedValue.pageless).toBe(pageless)
  })

  it('constrains landscape padding by the width instead of the short side', () => {
    expect(validate({ pageless: true, orientation: 'landscape', padding: '140' }).isValid).toBe(true)
    expect(validate({ pageless: false, orientation: 'landscape', padding: '140' }).isValid).toBe(false)
    expect(validate({ pageless: true, orientation: 'landscape', padding: '148.5' }).isValid).toBe(false)
    expect(validate({ pageless: true, orientation: 'portrait', padding: '105' }).isValid).toBe(false)
  })

  it('combines the cut helper and padding within the available width', () => {
    expect(
      validate({ pageless: true, orientation: 'landscape', padding: '140', cutHelperDistance: '8.49' }).isValid,
    ).toBe(true)
    const result = validate({ pageless: true, orientation: 'landscape', padding: '140', cutHelperDistance: '8.5' })
    expect(result.isValid).toBe(false)
    expect(result.issues.cutHelperDistance?.severity).toBe('error')
  })

  it('preserves valid settings when disabling pageless invalidates the padding', () => {
    const previous: ExportSettingsSchema = { ...current, pageless: true, orientation: 'landscape', padding: 140 }
    const input = { ...getEditableSchema(previous, context), pageless: false }
    const result = validateExportSettingsSchema(input, previous, context)
    expect(result.isValid).toBe(false)
    expect(result.committedValue).toEqual(previous)
  })
})
