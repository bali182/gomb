import type { PdfExportSettingsSchema } from './pdfExport'
import type { RecentProjectsSchema } from './recentProject'
import type { ThemeSchema } from './theme'

export type NumberEditorStepSchema = number | 'stitch-hole-distance'

export type ColorSettingsSchema = {
  leatherColor: string
  stitchHoleColor: string
  stitchLineColor: string
  strokeColor: string
  selectionColor: string
  cardColor: string
  threadColor: string
}

export type ExportStitchLineModeSchema = 'own-stitch-lines' | 'all-stitch-lines' | 'related-stitch-lines'

export type ExportLayoutSettingsSchema = {
  gap: number
  padding: number
}

export type ExportContentSettingsSchema = {
  stitchLineMode: ExportStitchLineModeSchema
  showNames: boolean
  showDimensions: boolean
  childMarkers: boolean
  cutHelperDistance: number
}

export type BaseExportSettingsSchema = ExportLayoutSettingsSchema & ExportContentSettingsSchema

export type AppSettingsSchema = {
  theme: ThemeSchema
  splitterSizes: [number | string, number | string]
}

export type EditSettingSchema = {
  step: NumberEditorStepSchema
  addBaseColor: boolean
}

export type ViewSettingsSchema = {
  stitchLinesVisible: boolean
  stitchHolesVisible: boolean
  stitchesVisible: boolean
  stitchCountVisible: boolean
  scale: number
}

export type GlobalSettingsSchema = {
  app: AppSettingsSchema
  edit: EditSettingSchema
  view: ViewSettingsSchema
  svgExport: BaseExportSettingsSchema
  pdfExport: PdfExportSettingsSchema
  recentProjects: RecentProjectsSchema
}
