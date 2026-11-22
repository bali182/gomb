import { useMemo } from 'react'
import type { ComponentSchema } from '../schemas/components'
import type { IssuesSchema } from '../schemas/issues'
import { getLimitIssues } from '../utils/getLimitIssues'
import { isDefined } from '../utils/isDefined'
import { noIssues } from '../utils/issueUtils'
import { useSubProject } from './useSubProject'
import { useTranslation } from './useTranslation'

export const useComponentLimitIssues = (component: ComponentSchema): IssuesSchema<ComponentSchema> => {
  const { computedAccessor } = useSubProject()
  const translation = useTranslation()
  const limits = computedAccessor.optional.limits.component(component.id)
  return useMemo<IssuesSchema<ComponentSchema>>(() => {
    if (!isDefined(limits) || limits.type !== component.type) {
      return noIssues<ComponentSchema>()
    }
    return getLimitIssues(component, limits, translation)
  }, [component, limits, translation])
}
