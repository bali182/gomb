import { useMemo } from 'react'
import type { HoleSchema } from '../schemas/hole'
import type { IssuesSchema } from '../schemas/issues'
import { accessors } from '../utils/accessors'
import { getLimitIssues } from '../utils/getLimitIssues'
import { isDefined } from '../utils/isDefined'
import { noIssues } from '../utils/issueUtils'
import { useSubProject } from './useSubProject'
import { useTranslation } from './useTranslation'

export const useHoleLimitIssues = (hole: HoleSchema): IssuesSchema<HoleSchema> => {
  const { computedSubProject } = useSubProject()
  const translation = useTranslation()
  const limits = accessors.computedSubProject(computedSubProject).optional.limits.hole(hole.id)
  return useMemo<IssuesSchema<HoleSchema>>(
    () => (isDefined(limits) ? getLimitIssues(hole, limits, translation) : noIssues<HoleSchema>()),
    [hole, limits, translation],
  )
}
