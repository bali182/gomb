import { useMemo } from 'react'
import { STITCH_LINE_LABEL_BACKGROUND_COLOR, STITCH_LINE_LABEL_COLOR, STROKE_THICKNESS } from '../constants/drawing'
import { getComponentColor } from '../utils/getComponentColor'
import { isDefined } from '../utils/isDefined'
import { produce } from '../utils/produce'
import { useProject } from './useProject'
import { useSubProject } from './useSubProject'

import { formatHex8, parse } from 'culori'
import { getSelectionObstructingComponentIds } from '../logic/getSelectionObstructingComponentIds'
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
import { useSubProjectSelection } from './useSubProjectSelection'

const addAlpha = (color: string): string => {
  const parsed = parse(color)
  if (!isDefined(parsed)) {
    return color
  }
  return formatHex8({ ...parsed, alpha: Math.min(parsed.alpha ?? 1, 0.3) })
}

const exportIdentifiers: DrawAreaExportIdentifiers = {
  getElementId: produce(undefined),
  getNameText: produce(undefined),
  getStitchLineId: produce(undefined),
}

const exportTextStyles: DrawAreaExportTextStyles = {
  getNameTextColor: produce(undefined),
  getNameTextFontFamily: produce(undefined),
  getNameTextFontSize: produce(undefined),
  getDimensionsText: produce(undefined),
  getDimensionsTextColor: produce(undefined),
  getDimensionsTextFontFamily: produce(undefined),
  getDimensionsTextFontSize: produce(undefined),
  getNameDimensionsGap: produce(undefined),
}

const markerStyles: DrawAreaMarkerStyles = {
  getColor: produce(undefined),
  getThickness: produce(undefined),
}

export const useEditorDrawArea = (): DrawAreaContextValue => {
  const { project } = useProject()
  const { subProject } = useSubProject()
  const drawAreaSelection = useSubProjectSelection(subProject)
  const { hovered, isHovered, isSelected, selected } = drawAreaSelection

  const {
    colorSettings: {
      cardColor,
      leatherColor,
      selectionColor,
      stitchHoleColor,
      stitchLineColor,
      strokeColor,
      threadColor,
    },
    stitchingSettings: { stitchHoleThickness, stitchLineThickness },
  } = project

  const selectionObstructingComponentIds = useMemo<ReadonlySet<string>>(
    () => getSelectionObstructingComponentIds(hovered ?? selected, subProject),
    [hovered, selected, subProject],
  )

  const componentStyles = useMemo<DrawAreaComponentStyles>(
    () => ({
      getBackgroundColor: ({ component, nestingLevel }) => {
        const color = component.color ?? getComponentColor(leatherColor, nestingLevel)

        if (component.type === 'pocket-cluster' && (isSelected(component) || isHovered(component))) {
          return addAlpha(color)
        }

        return selectionObstructingComponentIds.has(component.id) ? addAlpha(color) : color
      },
      getBorderColor: ({ component }) => {
        if (isSelected(component) || isHovered(component)) {
          return selectionColor
        }
        return selectionObstructingComponentIds.has(component.id) ? addAlpha(strokeColor) : strokeColor
      },
      getBorderThickness: () => {
        return STROKE_THICKNESS
      },
      getFilter: ({ component }) => {
        return isSelected(component) || isHovered(component) ? `drop-shadow(0px 0px 2px ${selectionColor})` : undefined
      },
    }),
    [isHovered, isSelected, leatherColor, selectionColor, strokeColor, selectionObstructingComponentIds],
  )

  const cardStyles = useMemo<DrawAreaCardStyles>(
    () => ({
      getBackgroundColor: ({ owner }) => {
        if (isSelected(owner) || isHovered(owner)) {
          return addAlpha(cardColor)
        }

        return selectionObstructingComponentIds.has(owner.id) ? addAlpha(cardColor) : cardColor
      },
      getStrokeColor: ({ owner }) => {
        return selectionObstructingComponentIds.has(owner.id) ? addAlpha(strokeColor) : strokeColor
      },
      getStrokeThickness: () => {
        return STROKE_THICKNESS
      },
    }),
    [isHovered, isSelected, cardColor, strokeColor, selectionObstructingComponentIds],
  )

  const holeStyles = useMemo<DrawAreaHoleStyles>(
    () => ({
      getFillColor: ({ hole }) => {
        return isSelected(hole) || isHovered(hole) ? addAlpha(selectionColor) : 'transparent'
      },
      getStrokeColor: ({ hole }) => {
        return isSelected(hole) || isHovered(hole) ? selectionColor : 'transparent'
      },
      getStrokeThickness: () => {
        return STROKE_THICKNESS
      },
    }),
    [isHovered, isSelected, selectionColor],
  )

  const stitchLineStyles = useMemo<DrawAreaStitchLineStyles>(
    () => ({
      getLineColor: (stitchLine) => {
        if (isSelected(stitchLine) || isHovered(stitchLine)) {
          return selectionColor
        }

        return stitchLineColor
      },
      getLineThickness: (stitchLine) => {
        return stitchLine.stitchLineThickness ?? stitchLineThickness
      },
      getStitchHoleColor: (stitchLine) => {
        if (isSelected(stitchLine) || isHovered(stitchLine)) {
          return selectionColor
        }

        return stitchHoleColor
      },
      getStitchHoleThickness: (stitchLine) => {
        return stitchLine.stitchHoleThickness ?? stitchHoleThickness
      },
      getThreadColor: () => {
        return threadColor
      },
      getThreadThickness: () => {
        return 0.5
      },
    }),
    [
      isHovered,
      isSelected,
      stitchLineColor,
      selectionColor,
      stitchLineThickness,
      stitchHoleColor,
      stitchHoleThickness,
      threadColor,
    ],
  )

  const stitchRouteLabelStyles = useMemo<DrawAreaStitchRouteLabelStyles>(
    () => ({
      getLabelBackgroundColor: produce(STITCH_LINE_LABEL_BACKGROUND_COLOR),
      getLabelColor: produce(STITCH_LINE_LABEL_COLOR),
      getLabelFontFamily: produce('sans-serif'),
      getLabelFontSize: produce(3.2),
    }),
    [],
  )

  const drawAreaContextValue = useMemo<DrawAreaContextValue>(
    () => ({
      isInteractive: true,
      isShowingCards: true,
      selection: drawAreaSelection,
      holeStyles,
      componentStyles,
      cardStyles,
      stitchLineStyles,
      exportTextStyles,
      markerStyles,
      exportIdentifiers,
      stitchRouteLabelStyles,
    }),
    [cardStyles, componentStyles, drawAreaSelection, holeStyles, stitchLineStyles, stitchRouteLabelStyles],
  )

  return drawAreaContextValue
}
