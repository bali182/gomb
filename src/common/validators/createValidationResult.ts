import type { IssuesSchema } from '../schemas/issues'
import type { ValidationResultInvalidSchema, ValidationResultValidSchema } from '../schemas/validation'

export const createValidValidationResult = <T>(
  issues: IssuesSchema<T>,
  value: T,
  committedValue = value,
): ValidationResultValidSchema<T> => {
  return {
    committedValue,
    isValid: true,
    issues,
    value,
  }
}

export const createInvalidValidationResult = <T>(
  issues: IssuesSchema<T>,
  committedValue: T,
): ValidationResultInvalidSchema<T> => {
  return {
    committedValue,
    isValid: false,
    issues,
    value: undefined,
  }
}
