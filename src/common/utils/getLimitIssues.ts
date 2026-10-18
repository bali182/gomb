import type { HasTypeSchema } from '../schemas/common'
import type { IssuesSchema } from '../schemas/issues'
import type { NumericBoundSchema, NumericFieldLimitsSchema, NumericLimitsSchema } from '../schemas/limits'
import type { NumericFieldNameSchema } from '../schemas/utils'
import type { TranslationResult } from '../translations/getTranslation'
import { isDefined } from './isDefined'
import { noIssues } from './issueUtils'

/** Evaluates only this model's own numeric fields, leaving nested models to their editors. */
export const getLimitIssues = <T extends HasTypeSchema<string>>(
  model: T,
  limits: NumericLimitsSchema<T>,
  translation: TranslationResult,
): IssuesSchema<T> => {
  let issues = noIssues<T>()
  for (const field in model) {
    const value = model[field]
    if (typeof value !== 'number') {
      continue
    }
    // The runtime numeric check establishes the field selection encoded by NumericFieldNameSchema.
    const fieldLimits = limits[field as NumericFieldNameSchema<T>]
    const bound = getViolatedBound(value, fieldLimits)
    if (isDefined(bound)) {
      issues = {
        ...issues,
        [field]: {
          severity: bound.severity,
          message: translation.t.limits.reasons[bound.reason](
            translation.t.formatters.number.max2(bound.value.toNumber()),
          ),
        },
      }
    }
  }
  return issues
}

const getViolatedBound = (
  value: number,
  limits: NumericFieldLimitsSchema | undefined,
): NumericBoundSchema | undefined => {
  if (isDefined(limits?.min) && limits.min.value.gt(value)) {
    return limits.min
  }
  if (isDefined(limits?.max) && limits.max.value.lt(value)) {
    return limits.max
  }
  return undefined
}
