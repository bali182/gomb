import { useMemo } from 'react'
import type { IssuesSchema } from '../schemas/issues'
import type { StitchLineSchema } from '../schemas/stitching'
import { accessors } from '../utils/accessors'
import { getLimitIssues } from '../utils/getLimitIssues'
import { getResolvedStitchLine } from '../utils/getResolvedStitchLine'
import { isDefined } from '../utils/isDefined'
import { noIssues } from '../utils/noIssues'
import { useProject } from './useProject'
import { useSubProject } from './useSubProject'
import { useTranslation } from './useTranslation'

export const useStitchLineLimitIssues = (stitchLine: StitchLineSchema): IssuesSchema<StitchLineSchema> => {
  const { computedSubProject } = useSubProject()
  const { project } = useProject()
  const translation = useTranslation()
  const limits = accessors.subProjectLimits(computedSubProject.limits).optional.stitchLine(stitchLine.id)
  return useMemo<IssuesSchema<StitchLineSchema>>(() => {
    if (!isDefined(limits) || limits.type !== stitchLine.type) {
      return noIssues<StitchLineSchema>()
    }
    const resolved = getResolvedStitchLine(stitchLine, project.stitchingSettings)
    return getLimitIssues(resolved, limits, translation)
  }, [stitchLine, project.stitchingSettings, limits, translation])
}
