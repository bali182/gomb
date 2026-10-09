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

export type GlobalSettingsContextValue = {
  setAppSettings: (settings: Partial<AppSettingsSchema>) => void
  setUISettings: (settings: Partial<UISettingsSchema>) => void
  setEditSettings: (settings: Partial<EditSettingSchema>) => void
  setExportSettings: (settings: Partial<ExportSettingsSchema>) => void
  setRecentProjects: (settings: Partial<RecentProjectsSchema>) => void
  setSettings: (settings: SetStateAction<GlobalSettingsSchema>) => void
  setViewSettings: (settings: Partial<ViewSettingsSchema>) => void
  settings: GlobalSettingsSchema
}

export const GlobalSettingsContext = createContext<GlobalSettingsContextValue | undefined>(undefined)
