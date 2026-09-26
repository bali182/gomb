import { HasVersionSchema } from './common'
import type { PdfExportSettingsSchema } from './pdfExport'
import type { RecentProjectsSchema } from './recentProject'
import type { ThemeSchema } from './theme'

export type LanguageSchema = 'hu-HU' | 'en-GB'

export type NumberEditorStepSchema = number | 'stitch-hole-distance'

export type ComponentColorSettingsSchema = {
  leatherColor: string
  strokeColor: string
  cardColor: string
}

export type StitchingColorSettingsSchema = {
  stitchHoleColor: string
  stitchLineColor: string
  threadColor: string
}

export type SelectionColorSettingsSchema = {
  selectionColor: string
}

export type ColorSettingsSchema = ComponentColorSettingsSchema &
  StitchingColorSettingsSchema &
  SelectionColorSettingsSchema

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

export type GlobalSettingsSchema = HasVersionSchema & {
  app: AppSettingsSchema
  edit: EditSettingSchema
  view: ViewSettingsSchema
  svgExport: BaseExportSettingsSchema
  pdfExport: PdfExportSettingsSchema
  recentProjects: RecentProjectsSchema
}
