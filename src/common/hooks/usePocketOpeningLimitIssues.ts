import { useMemo } from 'react'
import type { PocketClusterSchema, PocketOpeningSchema } from '../schemas/components'
import type { IssuesSchema } from '../schemas/issues'
import { accessors } from '../utils/accessors'
import { getLimitIssues } from '../utils/getLimitIssues'
import { isDefined } from '../utils/isDefined'
import { noIssues } from '../utils/issueUtils'
import { useSubProject } from './useSubProject'
import { useTranslation } from './useTranslation'

export const usePocketOpeningLimitIssues = (
  pocketCluster: PocketClusterSchema,
  opening: PocketOpeningSchema,
): IssuesSchema<PocketOpeningSchema> => {
  const { computedSubProject } = useSubProject()
  const translation = useTranslation()
  const limits = accessors.subProjectLimits(computedSubProject.limits).optional.opening(pocketCluster.id, opening.id)
  return useMemo<IssuesSchema<PocketOpeningSchema>>(() => {
    if (!isDefined(limits) || limits.type !== opening.type) {
      return noIssues<PocketOpeningSchema>()
    }
    return getLimitIssues(opening, limits, translation)
  }, [opening, limits, translation])
}
