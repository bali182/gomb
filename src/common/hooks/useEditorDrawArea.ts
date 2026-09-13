import { useCallback, useMemo } from 'react'
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
  const {
    editorSelection: selection,
    hoveredStitchLineId,
    hoveredTreeSelection,
    selectedHole,
    selectedStitchLine,
    isComponentSelected,
  } = drawAreaSelection

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
    () => getSelectionObstructingComponentIds(hoveredTreeSelection ?? selection, subProject),
    [hoveredTreeSelection, subProject, selection],
  )

  const isComponentTreeHovered = useCallback(
    (componentId: string): boolean =>
      hoveredTreeSelection?.type === 'component' && hoveredTreeSelection.componentId === componentId,
    [hoveredTreeSelection],
  )

  const isHoleTreeHovered = useCallback(
    (holeId: string): boolean => hoveredTreeSelection?.type === 'hole' && hoveredTreeSelection.holeId === holeId,
    [hoveredTreeSelection],
  )

  const isStitchLineTreeHovered = useCallback(
    (stitchLineId: string): boolean =>
      hoveredTreeSelection?.type === 'stitch-line' && hoveredTreeSelection.stitchLineId === stitchLineId,
    [hoveredTreeSelection],
  )

  const componentStyles = useMemo<DrawAreaComponentStyles>(
    () => ({
      getBackgroundColor: ({ component, isHovered, nestingLevel }) => {
        const color = component.color ?? getComponentColor(leatherColor, nestingLevel)

        if (component.type === 'pocket-cluster' && (isComponentSelected(component.id) || isHovered)) {
          return addAlpha(color)
        }

        return selectionObstructingComponentIds.has(component.id) ? addAlpha(color) : color
      },
      getBorderColor: ({ component, isHovered }) => {
        if (isComponentSelected(component.id) || isComponentTreeHovered(component.id) || isHovered) {
          return selectionColor
        }
        return selectionObstructingComponentIds.has(component.id) ? addAlpha(strokeColor) : strokeColor
      },
      getBorderThickness: () => {
        return STROKE_THICKNESS
      },
      getFilter: ({ component, isHovered }) => {
        return isComponentSelected(component.id) || isComponentTreeHovered(component.id) || isHovered
          ? `drop-shadow(0px 0px 2px ${selectionColor})`
          : undefined
      },
    }),
    [
      isComponentSelected,
      isComponentTreeHovered,
      leatherColor,
      selectionColor,
      strokeColor,
      selectionObstructingComponentIds,
    ],
  )

  const cardStyles = useMemo<DrawAreaCardStyles>(
    () => ({
      getBackgroundColor: ({ owner, isParentHovered }) => {
        if (isComponentSelected(owner.id) || isParentHovered) {
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
    [isComponentSelected, cardColor, strokeColor, selectionObstructingComponentIds],
  )

  const holeStyles = useMemo<DrawAreaHoleStyles>(
    () => ({
      getFillColor: ({ hole, isHovered }) => {
        return selectedHole?.id === hole.id || isHoleTreeHovered(hole.id) || isHovered
          ? addAlpha(selectionColor)
          : 'transparent'
      },
      getStrokeColor: ({ hole, isHovered }) => {
        return selectedHole?.id === hole.id || isHoleTreeHovered(hole.id) || isHovered ? selectionColor : 'transparent'
      },
      getStrokeThickness: () => {
        return STROKE_THICKNESS
      },
    }),
    [isHoleTreeHovered, selectionColor, selectedHole?.id],
  )

  const stitchLineStyles = useMemo<DrawAreaStitchLineStyles>(
    () => ({
      getLineColor: (stitchLine) => {
        if (
          selectedStitchLine?.id === stitchLine.id ||
          hoveredStitchLineId === stitchLine.id ||
          isStitchLineTreeHovered(stitchLine.id)
        ) {
          return selectionColor
        }

        return stitchLineColor
      },
      getLineThickness: (stitchLine) => {
        return stitchLine.stitchLineThickness ?? stitchLineThickness
      },
      getStitchHoleColor: (stitchLine) => {
        if (
          selectedStitchLine?.id === stitchLine.id ||
          hoveredStitchLineId === stitchLine.id ||
          isStitchLineTreeHovered(stitchLine.id)
        ) {
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
      selectedStitchLine?.id,
      hoveredStitchLineId,
      isStitchLineTreeHovered,
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
