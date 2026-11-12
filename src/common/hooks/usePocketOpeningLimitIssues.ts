import { useMemo } from 'react'
import type { PocketSchema } from '../schemas/components'
import type { IssuesSchema } from '../schemas/issues'
import type { PocketOpeningSchema } from '../schemas/pocketOpening'
import { accessors } from '../utils/accessors'
import { getLimitIssues } from '../utils/getLimitIssues'
import { isDefined } from '../utils/isDefined'
import { noIssues } from '../utils/issueUtils'
import { useSubProject } from './useSubProject'
import { useTranslation } from './useTranslation'

export const usePocketOpeningLimitIssues = (
  opening: PocketOpeningSchema,
  pocket: PocketSchema | undefined,
): IssuesSchema<PocketOpeningSchema> => {
  const { computedSubProject } = useSubProject()
  const translation = useTranslation()
  const limits = isDefined(pocket)
    ? accessors.computedSubProject(computedSubProject).optional.limits.component(pocket.id)
    : undefined

  return useMemo<IssuesSchema<PocketOpeningSchema>>(() => {
    if (
      !isDefined(limits) ||
      (limits.type !== 'front-pocket' && limits.type !== 't-pocket') ||
      limits.opening.type !== opening.type
    ) {
      return noIssues<PocketOpeningSchema>()
    }
    return getLimitIssues(opening, limits.opening, translation)
  }, [opening, limits, translation])
}
