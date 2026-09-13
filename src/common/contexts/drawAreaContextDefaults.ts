import type {
  DrawAreaCardStyles,
  DrawAreaComponentStyles,
  DrawAreaContextValue,
  DrawAreaExportIdentifiers,
  DrawAreaExportTextStyles,
  DrawAreaHoleStyles,
  DrawAreaMarkerStyles,
  DrawAreaStitchLineStyles,
  DrawAreaStitchRouteLabelStyles,
} from '../schemas/drawArea'
import { produce } from '../utils/produce'
import { defaultSubProjectSelection } from './SubProjectSelectionContext'

const drawAreaDefaultStitchLineStyles: DrawAreaStitchLineStyles = {
  getLineColor: produce(undefined),
  getLineThickness: produce(undefined),
  getStitchHoleColor: produce(undefined),
  getStitchHoleThickness: produce(undefined),
  getThreadColor: produce(undefined),
  getThreadThickness: produce(undefined),
}

const drawAreaDefaultHoleStyles: DrawAreaHoleStyles = {
  getFillColor: produce(undefined),
  getStrokeColor: produce(undefined),
  getStrokeThickness: produce(undefined),
}

const drawAreaDefaultComponentStyles: DrawAreaComponentStyles = {
  getBackgroundColor: produce(undefined),
  getBorderColor: produce(undefined),
  getBorderThickness: produce(undefined),
  getFilter: produce(undefined),
}

const drawAreaDefaultCardStyles: DrawAreaCardStyles = {
  getBackgroundColor: produce(undefined),
  getStrokeColor: produce(undefined),
  getStrokeThickness: produce(undefined),
}

const drawAreaDefaultExportTextStyles: DrawAreaExportTextStyles = {
  getNameTextColor: produce(undefined),
  getNameTextFontFamily: produce(undefined),
  getNameTextFontSize: produce(undefined),
  getDimensionsText: produce(undefined),
  getDimensionsTextColor: produce(undefined),
  getDimensionsTextFontFamily: produce(undefined),
  getDimensionsTextFontSize: produce(undefined),
  getNameDimensionsGap: produce(undefined),
}
const drawAreaExportIdentifiers: DrawAreaExportIdentifiers = {
  getElementId: produce(undefined),
  getStitchLineId: produce(undefined),
  getNameText: produce(undefined),
}

const drawAreaDefaultMarkerStyles: DrawAreaMarkerStyles = {
  getColor: produce(undefined),
  getThickness: produce(undefined),
}

const stitchRouteLabelStyles: DrawAreaStitchRouteLabelStyles = {
  getLabelBackgroundColor: produce(undefined),
  getLabelColor: produce(undefined),
  getLabelFontFamily: produce(undefined),
  getLabelFontSize: produce(undefined),
}

export const defaultDrawAreaContext: DrawAreaContextValue = {
  isInteractive: false,
  isShowingCards: false,
  selection: defaultSubProjectSelection,
  holeStyles: drawAreaDefaultHoleStyles,
  stitchLineStyles: drawAreaDefaultStitchLineStyles,
  componentStyles: drawAreaDefaultComponentStyles,
  cardStyles: drawAreaDefaultCardStyles,
  exportTextStyles: drawAreaDefaultExportTextStyles,
  markerStyles: drawAreaDefaultMarkerStyles,
  exportIdentifiers: drawAreaExportIdentifiers,
  stitchRouteLabelStyles: stitchRouteLabelStyles,
}
