import type { OptionalModelFieldsSchema } from './utils'

/** Determines how an issue is presented and its priority when multiple sources report it. */
export type SeveritySchema = 'error' | 'warning' | 'info'

/** A localized message describing a single problem or advisory condition. */
export type IssueSchema = {
  severity: SeveritySchema
  message: string
}

/** Optional model-shaped issues, with at most one issue for each leaf value. */
export type IssuesSchema<T> = OptionalModelFieldsSchema<T, IssueSchema | undefined>
