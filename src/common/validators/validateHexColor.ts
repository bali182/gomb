import type { BaseValidationContextSchema, ValidationResultSchema } from '../schemas/validation'
import { createInvalidValidationResult, createValidValidationResult } from './createValidationResult'

const hexColorPattern = /^#[0-9a-fA-F]{6}([0-9a-fA-F]{2})?$/

export const validateHexColor = (
  input: string,
  currentValue: string,
  context: BaseValidationContextSchema,
): ValidationResultSchema<string> => {
  if (!hexColorPattern.test(input)) {
    return createInvalidValidationResult<string>(
      {
        message: context.t.hexColor.invalid,
        severity: 'error',
      },
      currentValue,
    )
  }

  return createValidValidationResult<string>(undefined, input)
}
