import type { IssuesSchema } from '../schemas/issues'
import { isDefined } from './isDefined'
import { isRecord } from './isRecord'
import { narrowers } from './narrowers'

export const hasValidationErrors = <T>(result: IssuesSchema<T>): boolean => {
  return hasValidationErrorsInValue(result)
}

const hasValidationErrorsInValue = (value: unknown): boolean => {
  if (!isDefined(value)) {
    return false
  }

  if (narrowers.is.issue(value)) {
    return value.severity === 'error'
  }

  if (Array.isArray(value)) {
    return value.some(hasValidationErrorsInValue)
  }

  if (isRecord(value)) {
    return Object.values(value).some(hasValidationErrorsInValue)
  }

  return false
}
