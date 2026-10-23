import { useLayoutEffect, useMemo } from 'react'
import { STITCH_LINE_LABEL_BACKGROUND_COLOR, STITCH_LINE_LABEL_COLOR, STROKE_THICKNESS } from '../constants/drawing'
import { getComponentColor } from '../utils/getComponentColor'
import { isDefined } from '../utils/isDefined'
import { produce } from '../utils/produce'
import { useProject } from './useProject'
import { useSubProject } from './useSubProject'

import { formatHex8, parse } from 'culori'
import { getSelectionObstructingComponentIds } from '../logic/getSelectionObstructingComponentIds'
import type {
  DrawAreaCardStyleParams,
  DrawAreaCardStyles,
  DrawAreaComponentStyleParams,
  DrawAreaComponentStyles,
  DrawAreaContextValue,
  DrawAreaExportIdentifiers,
  DrawAreaExportTextStyles,
  DrawAreaHoleStyles,
  DrawAreaLabelStyles,
  DrawAreaMarkerStyles,
  DrawAreaStitchLineStyles,
} from '../schemas/drawArea'
import { StitchLineSchema } from '../schemas/stitching'
import { useSubProjectSelection } from './useSubProjectSelection'

const addAlpha = (color: string): string => {
  const parsed = parse(color)
  if (!isDefined(parsed)) {
    return color
  }
  return formatHex8({ ...parsed, alpha: Math.min(parsed.alpha ?? 1, 0.3) })
}

const getMaskColor = (color: string | undefined, maskColor: 'black' | 'white'): string | undefined => {
  if (!isDefined(color)) {
    return undefined
  }

  const parsed = parse(color)
  if (!isDefined(parsed)) {
    return undefined
  }

  const channel = maskColor === 'black' ? 0 : 1
  return formatHex8({ mode: 'rgb', r: channel, g: channel, b: channel, alpha: parsed.alpha ?? 1 })
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

export const useEditorDrawArea = (isInteractive: boolean): DrawAreaContextValue => {
  const { project } = useProject()
  const { subProject } = useSubProject()
  const drawAreaSelection = useSubProjectSelection(subProject)
  const { hovered, isHovered, isSelected, selected } = drawAreaSelection
  const { clearSelection, clearHover } = drawAreaSelection

  useLayoutEffect(() => {
    if (!isInteractive) {
      clearSelection()
      clearHover()
    }
  }, [isInteractive, clearSelection, clearHover])

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
    stitchingSettings: { stitchHoleLength, stitchHoleThickness, stitchLineThickness },
  } = project

  const selectionObstructingComponentIds = useMemo<ReadonlySet<string>>(
    () => getSelectionObstructingComponentIds(hovered ?? selected, subProject),
    [hovered, selected, subProject],
  )

  const componentStyles = useMemo<DrawAreaComponentStyles>(() => {
    const getBackgroundColor = ({ component, nestingLevel }: DrawAreaComponentStyleParams): string => {
      const color = component.color ?? getComponentColor(leatherColor, nestingLevel)
      if (component.type === 'pocket-cluster' && (isSelected(component) || isHovered(component))) {
        return addAlpha(color)
      }
      return selectionObstructingComponentIds.has(component.id) ? addAlpha(color) : color
    }

    const getBorderColor = ({ component }: DrawAreaComponentStyleParams): string => {
      if (isSelected(component) || isHovered(component)) {
        return selectionColor
      }
      return selectionObstructingComponentIds.has(component.id) ? addAlpha(strokeColor) : strokeColor
    }

    return {
      getBackgroundColor,
      getBorderColor,
      getMaskFillColor: (params) => {
        return getMaskColor(getBackgroundColor(params), 'white')
      },
      getMaskStrokeColor: (params) => {
        return getMaskColor(getBorderColor(params), 'white')
      },
      getBorderThickness: () => {
        return STROKE_THICKNESS
      },
      getFilter: ({ component }) => {
        return isSelected(component) || isHovered(component) ? `drop-shadow(0px 0px 2px ${selectionColor})` : undefined
      },
    }
  }, [isHovered, isSelected, leatherColor, selectionColor, strokeColor, selectionObstructingComponentIds])

  const cardStyles = useMemo<DrawAreaCardStyles>(() => {
    const getBackgroundColor = ({ owner }: DrawAreaCardStyleParams): string => {
      return selectionObstructingComponentIds.has(owner.id) ? addAlpha(cardColor) : cardColor
    }
    const getStrokeColor = ({ owner }: DrawAreaCardStyleParams): string => {
      return selectionObstructingComponentIds.has(owner.id) ? addAlpha(strokeColor) : strokeColor
    }

    return {
      getBackgroundColor,
      getStrokeColor,
      getMaskFillColor: (params) => {
        return getMaskColor(getBackgroundColor(params), 'black')
      },
      getMaskStrokeColor: (params) => {
        return getMaskColor(getStrokeColor(params), 'black')
      },
      getStrokeThickness: () => {
        return STROKE_THICKNESS
      },
    }
  }, [cardColor, strokeColor, selectionObstructingComponentIds])

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

  const stitchLineStyles = useMemo<DrawAreaStitchLineStyles>(() => {
    const getLineColor = (stitchLine: StitchLineSchema): string => {
      if (isSelected(stitchLine) || isHovered(stitchLine)) {
        return selectionColor
      }
      return stitchLineColor
    }
    return {
      getLineColor,
      getStitchHoleFootprintColor: (stitchLine) => {
        const color = getLineColor(stitchLine)
        const parsed = parse(color)
        if (!isDefined(parsed)) {
          return undefined
        }
        return formatHex8({ ...parsed, alpha: 0.2 })
      },
      getStitchHoleFootprintThickness: (stitchLine) => {
        const length = stitchLine.stitchHoleLength ?? stitchHoleLength
        const thickness = stitchLine.stitchHoleThickness ?? stitchHoleThickness
        return length / Math.SQRT2 + thickness + 0.3 // + 0.3 just for visual clarity
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
    }
  }, [
    isHovered,
    isSelected,
    stitchLineColor,
    selectionColor,
    stitchLineThickness,
    stitchHoleColor,
    stitchHoleThickness,
    stitchHoleLength,
    threadColor,
  ])

  const labelStyles = useMemo<DrawAreaLabelStyles>(
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
      isInteractive,
      isShowingCards: true,
      selection: drawAreaSelection,
      holeStyles,
      componentStyles,
      cardStyles,
      stitchLineStyles,
      exportTextStyles,
      markerStyles,
      exportIdentifiers,
      labelStyles,
    }),
    [cardStyles, componentStyles, drawAreaSelection, holeStyles, labelStyles, stitchLineStyles, isInteractive],
  )

  return drawAreaContextValue
}
