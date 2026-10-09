import { createContext, type SetStateAction } from 'react'
import type {
  AppSettingsSchema,
  EditSettingSchema,
  ExportSettingsSchema,
  GlobalSettingsSchema,
  UISettingsSchema,
  ViewSettingsSchema,
} from '../schemas/settings'

import type { RecentProjectsSchema } from '../schemas/recentProject'
import { notImplemented } from '../utils/notImplemented'

export type GlobalSettingsOperations = {
  setAppSettings: (settings: Partial<AppSettingsSchema>) => void
  setUISettings: (settings: Partial<UISettingsSchema>) => void
  setEditSettings: (settings: Partial<EditSettingSchema>) => void
  setExportSettings: (settings: Partial<ExportSettingsSchema>) => void
  setRecentProjects: (settings: Partial<RecentProjectsSchema>) => void
  setSettings: (settings: SetStateAction<GlobalSettingsSchema>) => void
  setViewSettings: (settings: Partial<ViewSettingsSchema>) => void
}

export type GlobalSettingsValues = {
  settings: GlobalSettingsSchema
}

export const DefaultGlobalSettingsOperations: GlobalSettingsOperations = {
  setAppSettings: notImplemented(),
  setUISettings: notImplemented(),
  setEditSettings: notImplemented(),
  setExportSettings: notImplemented(),
  setRecentProjects: notImplemented(),
  setSettings: notImplemented(),
  setViewSettings: notImplemented(),
}

export type GlobalSettingsContextValue = GlobalSettingsValues & GlobalSettingsOperations

export const GlobalSettingsContext = createContext<GlobalSettingsContextValue | undefined>(undefined)
