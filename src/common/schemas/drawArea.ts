import { SubProjectSelectionContextValue } from '../contexts/SubProjectSelectionContext'
import { ComponentSchema, PocketClusterSchema } from './components'
import { HoleSchema } from './hole'
import { ResolvedStitchLineSchema, StitchLineSchema } from './stitching'
import { SvgExportElementSchema } from './svgExport'

export type DrawAreaComponentStyleParams = {
  component: ComponentSchema
  nestingLevel: number
  isHovered: boolean
}

export type DrawAreaCardStyleParams = {
  owner: PocketClusterSchema
  isParentHovered: boolean
}

export type DrawAreaHoleStyleParams = {
  hole: HoleSchema
  isHovered: boolean
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
  getThreadColor: (stitchLine: StitchLineSchema) => string | undefined
  getThreadThickness: (stitchLine: StitchLineSchema) => number | undefined
}

export type DrawAreaHoleStyles = {
  getFillColor: (params: DrawAreaHoleStyleParams) => string | undefined
  getStrokeColor: (params: DrawAreaHoleStyleParams) => string | undefined
  getStrokeThickness: (params: DrawAreaHoleStyleParams) => number | undefined
}
export type DrawAreaExportIdentifiers = {
  getElementId: (element: SvgExportElementSchema) => string | undefined
  getStitchLineId: (element: ResolvedStitchLineSchema) => string | undefined
  getNameText: (element: SvgExportElementSchema) => string | undefined
}

export type DrawAreaExportTextStyles = {
  getNameTextColor: (element: SvgExportElementSchema) => string | undefined
  getNameTextFontFamily: (element: SvgExportElementSchema) => string | undefined
  getNameTextFontSize: (element: SvgExportElementSchema) => number | undefined
  getDimensionsText: (element: SvgExportElementSchema) => string | undefined
  getDimensionsTextColor: (element: SvgExportElementSchema) => string | undefined
  getDimensionsTextFontFamily: (element: SvgExportElementSchema) => string | undefined
  getDimensionsTextFontSize: (element: SvgExportElementSchema) => number | undefined
  getNameDimensionsGap: (element: SvgExportElementSchema) => number | undefined
}

export type DrawAreaStitchRouteLabelStyles = {
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
  stitchRouteLabelStyles: DrawAreaStitchRouteLabelStyles
}
