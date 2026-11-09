import { describe, expect, it } from 'vitest'
import { parseFeatureFlag } from './parseFeatureFlag'

describe('parseFeatureFlag', () => {
  it.each([
    { value: 'true', expected: true },
    { value: 'false', expected: false },
  ])('parses $value as a boolean', ({ value, expected }) => {
    expect(parseFeatureFlag('FEATURE_FLAG_TEST', value)).toBe(expected)
  })

  it.each([undefined, '', 'TRUE', 'FALSE', '1', '0', 'yes', ' true '])(
    'rejects %s and identifies the flag',
    (value) => {
      expect(() => parseFeatureFlag('FEATURE_FLAG_TEST', value)).toThrow('FEATURE_FLAG_TEST must be true or false')
    },
  )
})
