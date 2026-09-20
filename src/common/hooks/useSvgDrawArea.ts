import { useMemo } from 'react'
import { COMPONENT_DIMENSIONS_COLOR, COMPONENT_NAME_COLOR, STROKE_COLOR, STROKE_THICKNESS } from '../constants/drawing'
import { defaultDrawAreaContext } from '../contexts/drawAreaContextDefaults'
import { defaultSubProjectSelection } from '../contexts/SubProjectSelectionContext'
import { getSvgExportElementBoundingRect } from '../logic/exports/getSvgExportElementBoundingRect'
import type {
  DrawAreaComponentStyles,
  DrawAreaContextValue,
  DrawAreaExportIdentifiers,
  DrawAreaExportTextStyles,
  DrawAreaHoleStyles,
  DrawAreaMarkerStyles,
  DrawAreaStitchLineStyles,
} from '../schemas/drawArea'
import { BaseExportSettingsSchema } from '../schemas/settings'
import type { StitchLineCommonConfigSchema } from '../schemas/stitching'
import { produce } from '../utils/produce'
import { useTranslation } from './useTranslation'

export const useSvgDrawArea = (
  stitchingSettings: StitchLineCommonConfigSchema,
  settings: BaseExportSettingsSchema,
): DrawAreaContextValue => {
  const { t } = useTranslation()

  const componentStyles = useMemo<DrawAreaComponentStyles>(
    () => ({
      getBackgroundColor: produce('none'),
      getBorderColor: produce(STROKE_COLOR),
      getBorderThickness: produce(STROKE_THICKNESS),
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
      getNameText: (element) => {
        if (!settings.showNames) {
          return undefined
        }

        switch (element.type) {
          case 'svg-export-panel':
            return element.component.name
          case 'svg-export-front-pocket':
            return t.project.export.frontPocketName(element.ownerComponent.name)
          case 'svg-export-t-pocket':
            return t.project.export.tPocketName(element.ownerComponent.name, element.pocketIndex + 1)
        }
      },
    }),
    [settings.showNames, t.project.export],
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

        const boundingRect = getSvgExportElementBoundingRect(element)
        return t.formatters.dimensions(boundingRect.width.toFixed(1), boundingRect.height.toFixed(1))
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
      stitchRouteLabelStyles: defaultDrawAreaContext.stitchRouteLabelStyles,
    }),
    [componentStyles, exportIdentifiers, exportTextStyles, holeStyles, markerStyles, stitchLineStyles],
  )

  return drawAreaContextValue
}
