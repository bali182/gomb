import type { FC, PropsWithChildren } from 'react'
import { useCallback, useEffect, useEffectEvent, useMemo, useRef, useState } from 'react'
import type {
  AppSettingsSchema,
  EditSettingSchema,
  ExportSettingsSchema,
  GlobalSettingsSchema,
  UISettingsSchema,
  ViewSettingsSchema,
} from '../../common/schemas/settings'

import type { GlobalSettingsContextValue } from '../../common/contexts/GlobalSettingsContext'
import { GlobalSettingsContext } from '../../common/contexts/GlobalSettingsContext'

import type { RecentProjectsSchema } from '../../common/schemas/recentProject'

import { isDefined } from '../../common/utils/isDefined'
import { electronApi } from '../electronApi'

type ElectronGlobalSettingsContextProviderProps = PropsWithChildren<{
  initialSettings: GlobalSettingsSchema
}>

export const ElectronGlobalSettingsContextProvider: FC<ElectronGlobalSettingsContextProviderProps> = ({
  children,
  initialSettings,
}) => {
  const [settings, setSettings] = useState<GlobalSettingsSchema>(initialSettings)
  const isInitialSettings = useRef(true)

  const saveSettings = useEffectEvent(async (settings: GlobalSettingsSchema): Promise<void> => {
    const response = await electronApi.setSettings({ settings, type: 'settings-set' })
    if (response.type === 'error') {
      console.error('Unable to save Electron global settings')
    }
  })

  useEffect(() => {
    if (isInitialSettings.current) {
      isInitialSettings.current = false
      return
    }

    saveSettings(settings)
  }, [settings])

  const setAppSettings = useCallback((updates: Partial<AppSettingsSchema>): void => {
    setSettings((current) => ({ ...current, app: { ...current.app, ...updates } }))
  }, [])

  const setUISettings = useCallback((updates: Partial<UISettingsSchema>): void => {
    setSettings((current) => ({ ...current, ui: { ...current.ui, ...updates } }))
  }, [])

  const setEditSettings = useCallback((updates: Partial<EditSettingSchema>): void => {
    setSettings((current) => ({ ...current, edit: { ...current.edit, ...updates } }))
  }, [])

  const setViewSettings = useCallback((updates: Partial<ViewSettingsSchema>): void => {
    setSettings((current) => ({ ...current, view: { ...current.view, ...updates } }))
  }, [])

  const setExportSettings = useCallback((updates: Partial<ExportSettingsSchema>): void => {
    setSettings((current) => ({ ...current, export: { ...current.export, ...updates } }))
  }, [])

  const setRecentProjects = useCallback((updates: Partial<RecentProjectsSchema>): void => {
    setSettings((current) => {
      const recents: RecentProjectsSchema = { ...current.recentProjects }

      for (const [key, recentProject] of Object.entries(updates)) {
        if (isDefined(recentProject)) {
          recents[key] = recentProject
        }
      }

      return { ...current, recentProjects: recents }
    })
  }, [])

  const value = useMemo<GlobalSettingsContextValue>(
    () => ({
      setAppSettings,
      setEditSettings,
      setExportSettings,
      setRecentProjects,
      setSettings,
      setViewSettings,
      setUISettings,
      settings,
    }),
    [
      setAppSettings,
      setEditSettings,
      setExportSettings,
      setRecentProjects,
      setSettings,
      setViewSettings,
      setUISettings,
      settings,
    ],
  )

  return <GlobalSettingsContext.Provider value={value}>{children}</GlobalSettingsContext.Provider>
}
