import { useMemo } from 'react'
import type { IssuesSchema } from '../schemas/issues'
import { isDefined } from '../utils/isDefined'
import { isRecord } from '../utils/isRecord'
import { issueComparator } from '../utils/issueUtils'
import { narrowers } from '../utils/narrowers'

/** Merges model-shaped issues. Higher severity wins, with earlier sources winning ties. */
export const useCombinedIssues = <T>(...sources: [IssuesSchema<T>, ...IssuesSchema<T>[]]): IssuesSchema<T> =>
  useMemo<IssuesSchema<T>>(
    // The traversal preserves model keys and array indices, replacing only issue leaves.
    () => sources.reduce((combined, source) => combineIssues(combined, source) as IssuesSchema<T>),
    // Each caller supplies a fixed number of sources. Compare those sources rather than the rest array.
    // eslint-disable-next-line react-hooks/exhaustive-deps, react-hooks/use-memo
    sources,
  )

const combineIssues = (first: unknown, second: unknown): unknown => {
  if (!isDefined(first)) {
    return second
  }
  if (!isDefined(second) || first === second) {
    return first
  }

  if (narrowers.is.issue(first) && narrowers.is.issue(second)) {
    return issueComparator(second, first) < 0 ? second : first
  }

  if (Array.isArray(first) && Array.isArray(second)) {
    return Array.from({ length: Math.max(first.length, second.length) }, (_, index) =>
      combineIssues(first[index], second[index]),
    )
  }

  if (isRecord(first) && isRecord(second)) {
    const keys = new Set([...Object.keys(first), ...Object.keys(second)])
    return Object.fromEntries(Array.from(keys, (key) => [key, combineIssues(first[key], second[key])]))
  }

  return first
}
