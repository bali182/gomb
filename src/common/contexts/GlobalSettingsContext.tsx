import { createContext, type SetStateAction } from 'react'

import type { PdfExportSettingsSchema } from '../schemas/pdfExport'
import type { RecentProjectsSchema } from '../schemas/recentProject'
import type {
  AppSettingsSchema,
  BaseExportSettingsSchema,
  EditSettingSchema,
  GlobalSettingsSchema,
  UISettingsSchema,
  ViewSettingsSchema,
} from '../schemas/settings'

export type GlobalSettingsContextValue = {
  setAppSettings: (settings: Partial<AppSettingsSchema>) => void
  setUISettings: (settings: Partial<UISettingsSchema>) => void
  setEditSettings: (settings: Partial<EditSettingSchema>) => void
  setPdfExportSettings: (settings: Partial<PdfExportSettingsSchema>) => void
  setRecentProjects: (settings: Partial<RecentProjectsSchema>) => void
  setSettings: (settings: SetStateAction<GlobalSettingsSchema>) => void
  setSvgExportSettings: (settings: Partial<BaseExportSettingsSchema>) => void
  setViewSettings: (settings: Partial<ViewSettingsSchema>) => void
  settings: GlobalSettingsSchema
}

export const GlobalSettingsContext = createContext<GlobalSettingsContextValue | undefined>(undefined)
