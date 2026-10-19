import type { IssueSchema, IssuesSchema, SeveritySchema } from '../schemas/issues'
import type { EditorFieldTranslations } from '../schemas/translation'
import { isDefined } from './isDefined'
import { isRecord } from './isRecord'
import { narrowers } from './narrowers'

const EMPTY_ISSUES = Object.freeze({})

const issueSeverityPriorities: Record<SeveritySchema, number> = {
  error: 3,
  warning: 2,
  info: 1,
}

/** All object-model issue fields are optional, so an empty result can share one immutable object. */
export const noIssues = <T extends object>(): IssuesSchema<T> => EMPTY_ISSUES as IssuesSchema<T>

/** Sorts higher-severity issues first, returning zero when their severities match. */
export const issueComparator = (first: IssueSchema, second: IssueSchema): number =>
  issueSeverityPriorities[second.severity] - issueSeverityPriorities[first.severity]

export const getLabeledIssues = <T>(
  issues: IssuesSchema<T>,
  translations: Partial<EditorFieldTranslations<Extract<keyof T, string>>>,
): readonly IssueSchema[] => {
  if (!isRecord(issues)) {
    return []
  }

  const modelIssues: Record<string, unknown> = issues
  const labeledIssues: IssueSchema[] = []

  for (const field in translations) {
    const translation = translations[field as Extract<keyof T, string>]
    if (!isRecord(translation)) {
      continue
    }

    const issue = modelIssues[field]
    if (!narrowers.is.issue(issue)) {
      continue
    }

    labeledIssues.push(
      isDefined(translation.label) ? { ...issue, message: `${translation.label}: ${issue.message}` } : issue,
    )
  }

  return labeledIssues
}
