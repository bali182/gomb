import type { IssuesSchema } from '../schemas/issues'

const EMPTY_ISSUES = Object.freeze({})

/** All object-model issue fields are optional, so an empty result can share one immutable object. */
export const noIssues = <T extends object>(): IssuesSchema<T> => EMPTY_ISSUES as IssuesSchema<T>
