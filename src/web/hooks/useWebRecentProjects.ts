import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { useGlobalSettings } from '../../common/hooks/useGlobalSettings'
import { useTranslation2 } from '../../common/hooks/useTranslation2'
import type { RecentProjectVisualisationSchema } from '../../common/schemas/recentProject'
import { isDefined } from '../../common/utils/isDefined'
import { projectsAtom } from '../state/projectsAtom'
import { webAppRoutes } from '../webAppRoutes'

export const useWebRecentProjects = (): RecentProjectVisualisationSchema[] => {
  const projects = useAtomValue(projectsAtom)
  const { settings } = useGlobalSettings()
  const { t } = useTranslation2()

  return useMemo<RecentProjectVisualisationSchema[]>(() => {
    return projects
      .filter((project): boolean => isDefined(settings.recentProjects[project.id]))
      .map((project): RecentProjectVisualisationSchema => {
        const recentProject = settings.recentProjects[project.id]
        const lastOpenedSubProject = isDefined(recentProject?.lastSubProjectId)
          ? project.subProjects.find((subProject) => subProject.id === recentProject.lastSubProjectId)
          : undefined
        const subProject = isDefined(lastOpenedSubProject) ? lastOpenedSubProject : project.subProjects[0]

        return {
          formattedLastOpenedAt: t.formatters.timeago(recentProject.lastOpenedAt),
          id: project.id,
          label: project.name,
          link: isDefined(subProject)
            ? webAppRoutes.subProject(project.id, subProject.id)
            : webAppRoutes.project(project.id),
          lastOpenedAt: recentProject.lastOpenedAt,
        }
      })
      .sort((left, right): number => right.lastOpenedAt - left.lastOpenedAt)
  }, [projects, settings.recentProjects, t.formatters])
}
