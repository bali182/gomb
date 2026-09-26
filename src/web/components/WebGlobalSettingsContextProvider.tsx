import { useAtom } from 'jotai'
import type { FC, PropsWithChildren } from 'react'
import { useCallback, useMemo } from 'react'

import type { GlobalSettingsContextValue } from '../../common/contexts/GlobalSettingsContext'
import { GlobalSettingsContext } from '../../common/contexts/GlobalSettingsContext'
import type { PdfExportSettingsSchema } from '../../common/schemas/pdfExport'
import type { RecentProjectsSchema } from '../../common/schemas/recentProject'
import type {
  AppSettingsSchema,
  BaseExportSettingsSchema,
  EditSettingSchema,
  UISettingsSchema,
  ViewSettingsSchema,
} from '../../common/schemas/settings'
import { isDefined } from '../../common/utils/isDefined'
import { globalSettingsAtom } from '../state/globalSettingsAtom'

export const WebGlobalSettingsContextProvider: FC<PropsWithChildren> = ({ children }) => {
  const [settings, setSettings] = useAtom(globalSettingsAtom)

  const setAppSettings = useCallback(
    (updates: Partial<AppSettingsSchema>): void => {
      setSettings((current) => ({ ...current, app: { ...current.app, ...updates } }))
    },
    [setSettings],
  )

  const setUISettings = useCallback(
    (updates: Partial<UISettingsSchema>): void => {
      setSettings((current) => ({ ...current, ui: { ...current.ui, ...updates } }))
    },
    [setSettings],
  )

  const setEditSettings = useCallback(
    (updates: Partial<EditSettingSchema>): void => {
      setSettings((current) => ({ ...current, edit: { ...current.edit, ...updates } }))
    },
    [setSettings],
  )

  const setViewSettings = useCallback(
    (updates: Partial<ViewSettingsSchema>): void => {
      setSettings((current) => ({ ...current, view: { ...current.view, ...updates } }))
    },
    [setSettings],
  )

  const setSvgExportSettings = useCallback(
    (updates: Partial<BaseExportSettingsSchema>): void => {
      setSettings((current) => ({ ...current, svgExport: { ...current.svgExport, ...updates } }))
    },
    [setSettings],
  )

  const setPdfExportSettings = useCallback(
    (updates: Partial<PdfExportSettingsSchema>): void => {
      setSettings((current) => ({ ...current, pdfExport: { ...current.pdfExport, ...updates } }))
    },
    [setSettings],
  )

  const setRecentProjects = useCallback(
    (updates: Partial<RecentProjectsSchema>): void => {
      setSettings((current) => {
        const recents: RecentProjectsSchema = { ...current.recentProjects }

        for (const [key, recentProject] of Object.entries(updates)) {
          if (isDefined(recentProject)) {
            recents[key] = recentProject
          }
        }

        return { ...current, recentProjects: recents }
      })
    },
    [setSettings],
  )

  const value = useMemo<GlobalSettingsContextValue>(
    () => ({
      setAppSettings,
      setEditSettings,
      setPdfExportSettings,
      setRecentProjects,
      setSettings,
      setSvgExportSettings,
      setViewSettings,
      setUISettings,
      settings,
    }),
    [
      setAppSettings,
      setEditSettings,
      setPdfExportSettings,
      setRecentProjects,
      setSettings,
      setSvgExportSettings,
      setUISettings,
      setViewSettings,
      settings,
    ],
  )

  return <GlobalSettingsContext.Provider value={value}>{children}</GlobalSettingsContext.Provider>
}
