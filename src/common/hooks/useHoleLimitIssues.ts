import { useMemo } from 'react'
import type { HoleSchema } from '../schemas/hole'
import type { IssuesSchema } from '../schemas/issues'
import { getLimitIssues } from '../utils/getLimitIssues'
import { isDefined } from '../utils/isDefined'
import { noIssues } from '../utils/issueUtils'
import { useSubProject } from './useSubProject'
import { useTranslation } from './useTranslation'

export const useHoleLimitIssues = (hole: HoleSchema): IssuesSchema<HoleSchema> => {
  const { computedAccessor } = useSubProject()
  const translation = useTranslation()
  const limits = computedAccessor.optional.limits.hole(hole.id)
  return useMemo<IssuesSchema<HoleSchema>>(
    () => (isDefined(limits) ? getLimitIssues(hole, limits, translation) : noIssues<HoleSchema>()),
    [hole, limits, translation],
  )
}
