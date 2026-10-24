import { useMemo } from 'react'
import { COMPONENT_DIMENSIONS_COLOR, COMPONENT_NAME_COLOR, STROKE_COLOR, STROKE_THICKNESS } from '../constants/drawing'
import { defaultDrawAreaContext } from '../contexts/drawAreaContextDefaults'
import { defaultSubProjectSelection } from '../contexts/SubProjectSelectionContext'
import { getExportElementBoundingRect } from '../logic/exports/exportGeometryUtils'
import { getComponentParent } from '../operations/subProject/utils/getComponentParent'
import type {
  DrawAreaComponentStyles,
  DrawAreaContextValue,
  DrawAreaExportIdentifiers,
  DrawAreaExportTextStyles,
  DrawAreaHoleStyles,
  DrawAreaMarkerStyles,
  DrawAreaStitchLineStyles,
} from '../schemas/drawArea'
import { ExportSettingsSchema } from '../schemas/settings'
import type { StitchLineCommonConfigSchema } from '../schemas/stitching'
import { produce } from '../utils/produce'
import { useTranslation } from './useTranslation'

export const useExportDrawArea = (
  stitchingSettings: StitchLineCommonConfigSchema,
  settings: ExportSettingsSchema,
): DrawAreaContextValue => {
  const { t } = useTranslation()

  const componentStyles = useMemo<DrawAreaComponentStyles>(
    () => ({
      getBackgroundColor: produce('none'),
      getBorderColor: produce(STROKE_COLOR),
      getMaskFillColor: produce(undefined),
      getMaskStrokeColor: produce(undefined),
      getBorderThickness: produce(STROKE_THICKNESS),
      getBorderDasharray: produce(undefined),
      getFilter: produce(undefined),
    }),
    [],
  )

  const stitchLineStyles = useMemo<DrawAreaStitchLineStyles>(
    () => ({
      getLineColor: produce(STROKE_COLOR),
      getLineThickness: (stitchLine) => {
        return stitchLine.stitchLineThickness ?? stitchingSettings.stitchLineThickness
      },
      getStitchHoleColor: produce(STROKE_COLOR),
      getStitchHoleFootprintColor: produce(undefined),
      getStitchHoleFootprintThickness: produce(undefined),
      getStitchHoleThickness: (stitchLine) => {
        return stitchLine.stitchHoleThickness ?? stitchingSettings.stitchHoleThickness
      },
      getThreadColor: produce(undefined),
      getThreadThickness: produce(undefined),
    }),
    [stitchingSettings.stitchHoleThickness, stitchingSettings.stitchLineThickness],
  )

  const holeStyles = useMemo<DrawAreaHoleStyles>(
    () => ({
      getFillColor: produce('transparent'),
      getStrokeColor: produce('transparent'),
      getStrokeThickness: produce(STROKE_THICKNESS),
    }),
    [],
  )

  const exportIdentifiers = useMemo<DrawAreaExportIdentifiers>(
    () => ({
      getElementId: (element) => {
        return element.id
      },
      getStitchLineId: (stitchLine) => {
        return stitchLine.id
      },
      getParentNameText: (element) => {
        if (!settings.showParentNames) {
          return undefined
        }
        return getComponentParent(element.component.id, element.subProject)?.name
      },
      getNameText: (element) => {
        if (!settings.showNames) {
          return undefined
        }

        switch (element.type) {
          case 'export-panel':
            return element.component.name
          case 'export-front-pocket':
            return element.component.name
          case 'export-t-pocket':
            return element.component.name
        }
      },
    }),
    [settings.showNames, settings.showParentNames],
  )

  const exportTextStyles = useMemo<DrawAreaExportTextStyles>(
    () => ({
      getNameTextColor: produce(COMPONENT_NAME_COLOR),
      getNameTextFontFamily: produce('sans-serif'),
      getNameTextFontSize: produce(3),
      getDimensionsText: (element) => {
        if (!settings.showDimensions) {
          return undefined
        }

        const boundingRect = getExportElementBoundingRect(element)
        return t.formatters.dimensions(
          t.formatters.number.max1(boundingRect.width.toNumber()),
          t.formatters.number.max1(boundingRect.height.toNumber()),
        )
      },
      getDimensionsTextColor: produce(COMPONENT_DIMENSIONS_COLOR),
      getDimensionsTextFontFamily: produce('sans-serif'),
      getDimensionsTextFontSize: produce(2.5),
      getNameDimensionsGap: produce(1),
    }),
    [settings.showDimensions, t],
  )

  const markerStyles = useMemo<DrawAreaMarkerStyles>(
    () => ({
      getColor: produce('#666666'),
      getThickness: produce(0.3),
    }),
    [],
  )

  const drawAreaContextValue = useMemo<DrawAreaContextValue>(
    () => ({
      isInteractive: false,
      isShowingCards: false,
      selection: defaultSubProjectSelection,
      holeStyles,
      componentStyles,
      cardStyles: defaultDrawAreaContext.cardStyles,
      stitchLineStyles,
      exportTextStyles,
      markerStyles,
      exportIdentifiers,
      labelStyles: defaultDrawAreaContext.labelStyles,
    }),
    [componentStyles, exportIdentifiers, exportTextStyles, holeStyles, markerStyles, stitchLineStyles],
  )

  return drawAreaContextValue
}
