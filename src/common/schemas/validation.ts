import type { DecimalLocale } from 'validator/es/lib/isDecimal'

import type { TranslationSchema2 } from '../translations/translationSchema'
import type { ProjectSchema } from './project'
import type { ComputedSubProjectSchema, SubProjectSchema } from './subProject'

export type SeveritySchema = 'error' | 'warning' | 'info'

export type IssueSchema = {
  severity: SeveritySchema
  message: string
}

export type ValidationIssuesSchema<T> = T extends readonly unknown[]
  ? { [K in keyof T]: ValidationIssuesSchema<T[K]> }
  : T extends object
    ? { [K in keyof T]: ValidationIssuesSchema<T[K]> }
    : IssueSchema | undefined

export type ValidationResultValidSchema<T> = {
  isValid: true
  issues: ValidationIssuesSchema<T>
  value: T
  committedValue: T
}

export type ValidationResultInvalidSchema<T> = {
  isValid: false
  issues: ValidationIssuesSchema<T>
  value: undefined
  committedValue: T
}

export type ValidationResultSchema<T> = ValidationResultValidSchema<T> | ValidationResultInvalidSchema<T>

export type BaseValidationContextSchema = {
  language: DecimalLocale
  t: TranslationSchema2['validation']
}

export type ComponentBasedValidationContextSchema = BaseValidationContextSchema & {
  project: ProjectSchema
  subProject: SubProjectSchema
  computedSubProject: ComputedSubProjectSchema
}

export type ProjectBasedValidationContextSchema = BaseValidationContextSchema & {
  projects: readonly ProjectSchema[]
}
