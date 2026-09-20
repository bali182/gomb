import { useCallback, useEffect, useEffectEvent, useMemo, useRef, useState, type SetStateAction } from 'react'

import { useGlobalSettings } from '../../common/hooks/useGlobalSettings'
import { useTranslation2 } from '../../common/hooks/useTranslation2'
import { Loadable } from '../../common/loadable'
import type { LoadableSchema } from '../../common/schemas/loadable'
import type { RecentProjectSchema, RecentProjectVisualisationSchema } from '../../common/schemas/recentProject'
import { isDefined } from '../../common/utils/isDefined'
import { electronApi } from '../electronApi'
import { electronAppRoutes } from '../electronAppRoutes'

export const useElectronRecentProjects = (): LoadableSchema<RecentProjectVisualisationSchema[]> => {
  const { settings } = useGlobalSettings()
  const { t } = useTranslation2()

  const candidates = useMemo<RecentProjectVisualisationSchema[]>(() => {
    const recentProjectEntries: Array<[string, RecentProjectSchema]> = Object.entries(settings.recentProjects)
    return recentProjectEntries
      .map(([filePath, recentProject]: [string, RecentProjectSchema]): RecentProjectVisualisationSchema => {
        return {
          formattedLastOpenedAt: t.formatters.timeago(recentProject.lastOpenedAt),
          id: filePath,
          label: filePath,
          link: isDefined(recentProject.lastSubProjectId)
            ? electronAppRoutes.subProject(filePath, recentProject.lastSubProjectId)
            : electronAppRoutes.project(filePath),
          lastOpenedAt: recentProject.lastOpenedAt,
        }
      })
      .sort((left, right): number => right.lastOpenedAt - left.lastOpenedAt)
  }, [settings.recentProjects, t.formatters])

  return useExistingElectronRecentProjects(candidates)
}

const useExistingElectronRecentProjects = (
  candidates: RecentProjectVisualisationSchema[],
): LoadableSchema<RecentProjectVisualisationSchema[]> => {
  const requestIdRef = useRef(0)
  const [recentProjects, setRecentProjects] = useState<LoadableSchema<RecentProjectVisualisationSchema[]>>(() =>
    Loadable.uninitialized(),
  )

  const setRecentProjectsForRequest = useCallback(
    (requestId: number, update: SetStateAction<LoadableSchema<RecentProjectVisualisationSchema[]>>): void => {
      if (requestId !== requestIdRef.current) {
        return
      }
      setRecentProjects(update)
    },
    [],
  )

  const loadRecentProjects = useEffectEvent(async (): Promise<void> => {
    const requestId = ++requestIdRef.current

    setRecentProjectsForRequest(requestId, (current) =>
      Loadable.hasValue(current) ? Loadable.loadingWith(current.data) : Loadable.loading(),
    )

    const filePaths = candidates.map((candidate): string => candidate.id)
    const response = await electronApi.findExistingFilePaths({ filePaths, type: 'find-existing-file-paths' })

    if (response.type === 'error') {
      return setRecentProjectsForRequest(requestId, Loadable.failed(response))
    }

    const existingFilePaths = new Set(response.filePaths)
    const existingRecentProjects = candidates.filter((candidate) => existingFilePaths.has(candidate.id))

    setRecentProjectsForRequest(requestId, Loadable.loaded(existingRecentProjects))
  })

  useEffect(() => {
    loadRecentProjects()
  }, [candidates])

  return recentProjects
}
