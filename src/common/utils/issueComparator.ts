import type { IssueSchema, SeveritySchema } from '../schemas/issues'

const issueSeverityPriorities: Record<SeveritySchema, number> = {
  error: 3,
  warning: 2,
  info: 1,
}

/** Sorts higher-severity issues first, returning zero when their severities match. */
export const issueComparator = (first: IssueSchema, second: IssueSchema): number =>
  issueSeverityPriorities[second.severity] - issueSeverityPriorities[first.severity]
