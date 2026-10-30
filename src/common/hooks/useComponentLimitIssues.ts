import { useMemo } from 'react'
import type { ComponentSchema } from '../schemas/components'
import type { IssuesSchema } from '../schemas/issues'
import { accessors } from '../utils/accessors'
import { getLimitIssues } from '../utils/getLimitIssues'
import { isDefined } from '../utils/isDefined'
import { noIssues } from '../utils/issueUtils'
import { narrowers } from '../utils/narrowers'
import { useSubProject } from './useSubProject'
import { useTranslation } from './useTranslation'

export const useComponentLimitIssues = (component: ComponentSchema): IssuesSchema<ComponentSchema> => {
  const { computedSubProject } = useSubProject()
  const translation = useTranslation()
  const limits = accessors.subProjectLimits(computedSubProject.limits).optional.component(component.id)
  return useMemo<IssuesSchema<ComponentSchema>>(() => {
    if (!isDefined(limits) || limits.type !== component.type) {
      return noIssues<ComponentSchema>()
    }
    if (narrowers.is.frontPocket(component) && limits.type === 'front-pocket') {
      return {
        ...getLimitIssues(component, limits, translation),
        opening: getLimitIssues(component.opening, limits.opening, translation),
      }
    }
    if (narrowers.is.tPocket(component) && limits.type === 't-pocket') {
      return {
        ...getLimitIssues(component, limits, translation),
        opening: getLimitIssues(component.opening, limits.opening, translation),
      }
    }
    return getLimitIssues(component, limits, translation)
  }, [component, limits, translation])
}
