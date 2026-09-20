import type { BaseValidationContextSchema, ValidationIssuesSchema, ValidationResultSchema } from '../schemas/validation'
import { isDefined } from '../utils/isDefined'
import { createInvalidValidationResult, createValidValidationResult } from './createValidationResult'

export function validatePrimitiveUnion<T extends string>(
  value: string | undefined,
  currentValue: T,
  allowedValues: Record<T, boolean>,
  context: BaseValidationContextSchema,
  allowUndefined?: false,
): ValidationResultSchema<T>

export function validatePrimitiveUnion<T extends string>(
  value: string | undefined,
  currentValue: T | undefined,
  allowedValues: Record<T, boolean>,
  context: BaseValidationContextSchema,
  allowUndefined: true,
): ValidationResultSchema<T | undefined>

export function validatePrimitiveUnion<T extends string>(
  value: string | undefined,
  currentValue: T | undefined,
  allowedValues: Record<T, boolean>,
  context: BaseValidationContextSchema,
  allowUndefined = false,
): ValidationResultSchema<T | undefined> {
  if (!isDefined(value)) {
    if (allowUndefined) {
      return createValidValidationResult<undefined>(undefined, undefined)
    }

    return createInvalidValidationResult<T | undefined>(
      {
        message: context.t.primitive.required,
        severity: 'error',
      },
      currentValue,
    )
  }

  if (!isAllowedPrimitiveUnionValue(value, allowedValues)) {
    return createInvalidValidationResult<T | undefined>(
      {
        message: context.t.primitive.invalid,
        severity: 'error',
      },
      currentValue,
    )
  }

  return createValidValidationResult<T>(undefined as ValidationIssuesSchema<T>, value)
}

const isAllowedPrimitiveUnionValue = <T extends string>(
  value: string,
  allowedValues: Record<T, boolean>,
): value is T => {
  return Object.keys(allowedValues).includes(value)
}
