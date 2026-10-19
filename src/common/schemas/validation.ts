import type { DecimalLocale } from 'validator/es/lib/isDecimal'

import type { TranslationSchema } from '../translations/translationSchema'
import type { IssuesSchema } from './issues'
import type { ProjectSchema } from './project'
import type { ComputedSubProjectSchema, SubProjectSchema } from './subProject'

export type ValidationResultValidSchema<T> = {
  isValid: true
  issues: IssuesSchema<T>
  value: T
  committedValue: T
}

export type ValidationResultInvalidSchema<T> = {
  isValid: false
  issues: IssuesSchema<T>
  value: undefined
  committedValue: T
}

export type ValidationResultSchema<T> = ValidationResultValidSchema<T> | ValidationResultInvalidSchema<T>

export type BaseValidationContextSchema = {
  language: DecimalLocale
  t: TranslationSchema['validation']
}

export type ComponentBasedValidationContextSchema = BaseValidationContextSchema & {
  project: ProjectSchema
  subProject: SubProjectSchema
  computedSubProject: ComputedSubProjectSchema
}

export type ProjectBasedValidationContextSchema = BaseValidationContextSchema & {
  projects: readonly ProjectSchema[]
}
