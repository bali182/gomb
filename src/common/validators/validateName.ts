import { HasIdentitySchema } from '../schemas/common'
import type { BaseValidationContextSchema, ValidationResultSchema } from '../schemas/validation'
import { createInvalidValidationResult, createValidValidationResult } from './createValidationResult'

export const validateName = (
  input: string,
  currentValue: string,
  id: string,
  values: readonly HasIdentitySchema[],
  context: BaseValidationContextSchema,
): ValidationResultSchema<string> => {
  if (input === '') {
    return createInvalidValidationResult<string>(
      {
        message: context.t.name.empty,
        severity: 'error',
      },
      currentValue,
    )
  }

  const hasDuplicateName = values.some((value) => value.id !== id && value.name === input)

  if (hasDuplicateName) {
    return createInvalidValidationResult<string>(
      {
        message: context.t.name.duplicate,
        severity: 'error',
      },
      currentValue,
    )
  }

  return createValidValidationResult<string>(undefined, input)
}
