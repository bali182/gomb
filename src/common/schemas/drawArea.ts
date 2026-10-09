import { SubProjectSelectionContextValue } from '../contexts/SubProjectSelectionContext'
import { ComponentSchema, PocketClusterSchema } from './components'
import type { ExportElementSchema } from './export'
import { HoleSchema } from './hole'
import { ResolvedStitchLineSchema, StitchLineSchema } from './stitching'

export type DrawAreaComponentStyleParams = {
  component: ComponentSchema
  nestingLevel: number
}

export type DrawAreaCardStyleParams = {
  owner: PocketClusterSchema
}

export type DrawAreaHoleStyleParams = {
  hole: HoleSchema
}

export type DrawAreaComponentStyles = {
  getBackgroundColor: (params: DrawAreaComponentStyleParams) => string | undefined
  getBorderColor: (params: DrawAreaComponentStyleParams) => string | undefined
  getBorderThickness: (params: DrawAreaComponentStyleParams) => number | undefined
  getFilter: (params: DrawAreaComponentStyleParams) => string | undefined
}

export type DrawAreaCardStyles = {
  getBackgroundColor: (params: DrawAreaCardStyleParams) => string | undefined
  getStrokeColor: (params: DrawAreaCardStyleParams) => string | undefined
  getStrokeThickness: (params: DrawAreaCardStyleParams) => number | undefined
}

export type DrawAreaStitchLineStyles = {
  getLineColor: (stitchLine: StitchLineSchema) => string | undefined
  getLineThickness: (stitchLine: StitchLineSchema) => number | undefined
  getStitchHoleColor: (stitchLine: StitchLineSchema) => string | undefined
  getStitchHoleThickness: (stitchLine: StitchLineSchema) => number | undefined
  getStitchHoleFootprintColor: (stitchLine: StitchLineSchema) => string | undefined
  getStitchHoleFootprintThickness: (stitchLine: StitchLineSchema) => number | undefined
  getThreadColor: (stitchLine: StitchLineSchema) => string | undefined
  getThreadThickness: (stitchLine: StitchLineSchema) => number | undefined
}

export type DrawAreaHoleStyles = {
  getFillColor: (params: DrawAreaHoleStyleParams) => string | undefined
  getStrokeColor: (params: DrawAreaHoleStyleParams) => string | undefined
  getStrokeThickness: (params: DrawAreaHoleStyleParams) => number | undefined
}
export type DrawAreaExportIdentifiers = {
  getElementId: (element: ExportElementSchema) => string | undefined
  getStitchLineId: (element: ResolvedStitchLineSchema) => string | undefined
  getNameText: (element: ExportElementSchema) => string | undefined
}

export type DrawAreaExportTextStyles = {
  getNameTextColor: (element: ExportElementSchema) => string | undefined
  getNameTextFontFamily: (element: ExportElementSchema) => string | undefined
  getNameTextFontSize: (element: ExportElementSchema) => number | undefined
  getDimensionsText: (element: ExportElementSchema) => string | undefined
  getDimensionsTextColor: (element: ExportElementSchema) => string | undefined
  getDimensionsTextFontFamily: (element: ExportElementSchema) => string | undefined
  getDimensionsTextFontSize: (element: ExportElementSchema) => number | undefined
  getNameDimensionsGap: (element: ExportElementSchema) => number | undefined
}

export type DrawAreaLabelStyles = {
  getLabelBackgroundColor: () => string | undefined
  getLabelColor: () => string | undefined
  getLabelFontFamily: () => string | undefined
  getLabelFontSize: () => number | string | undefined
}

export type DrawAreaMarkerStyles = {
  getColor: () => string | undefined
  getThickness: () => number | undefined
}

export type DrawAreaContextValue = {
  isInteractive: boolean
  isShowingCards: boolean
  selection: SubProjectSelectionContextValue
  holeStyles: DrawAreaHoleStyles
  stitchLineStyles: DrawAreaStitchLineStyles
  componentStyles: DrawAreaComponentStyles
  cardStyles: DrawAreaCardStyles
  exportTextStyles: DrawAreaExportTextStyles
  exportIdentifiers: DrawAreaExportIdentifiers
  markerStyles: DrawAreaMarkerStyles
  labelStyles: DrawAreaLabelStyles
}
