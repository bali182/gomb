import { useLayoutEffect, useMemo } from 'react'
import {
  EMPTY_POCKET_CLUSTER_BORDER_DASHARRAY,
  STITCH_LINE_LABEL_BACKGROUND_COLOR,
  STITCH_LINE_LABEL_COLOR,
  STROKE_THICKNESS,
} from '../constants/drawing'
import { PocketEditorTabs } from '../constants/editorTabs'
import { getComponentColor } from '../utils/getComponentColor'
import { isDefined } from '../utils/isDefined'
import { narrowers } from '../utils/narrowers'
import { produce } from '../utils/produce'
import { useGlobalSettings } from './useGlobalSettings'
import { useProject } from './useProject'
import { useSubProject } from './useSubProject'

import { formatHex8, parse } from 'culori'
import { getSelectionOpacities, type SelectionOpacitiesSchema } from '../logic/getSelectionOpacities'
import type {
  DrawAreaComponentStyleParams,
  DrawAreaComponentStyles,
  DrawAreaContextValue,
  DrawAreaExportIdentifiers,
  DrawAreaExportTextStyles,
  DrawAreaHoleStyles,
  DrawAreaLabelStyles,
  DrawAreaMarkerStyles,
  DrawAreaPocketItemStyleParams,
  DrawAreaPocketItemStyles,
  DrawAreaStitchLineStyles,
} from '../schemas/drawArea'
import { StitchLineSchema } from '../schemas/stitching'
import { useSubProjectSelection } from './useSubProjectSelection'

const applyOpacity = (color: string, opacity: number): string => {
  if (opacity === 1) {
    return color
  }
  const parsed = parse(color)
  if (!isDefined(parsed)) {
    return color
  }
  return formatHex8({ ...parsed, alpha: (parsed.alpha ?? 1) * opacity })
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
  getParentNameText: produce(undefined),
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

type UseEditorDrawAreaParams = {
  isInteractive: boolean
  editorTabs?: Readonly<Partial<Record<string, string>>>
}

export const useEditorDrawArea = ({ isInteractive, editorTabs }: UseEditorDrawAreaParams): DrawAreaContextValue => {
  const { project } = useProject()
  const { settings } = useGlobalSettings()
  const { subProject } = useSubProject()
  const drawAreaSelection = useSubProjectSelection(subProject)
  const { isHovered, isSelected, selected } = drawAreaSelection
  const { clearSelection, clearHover } = drawAreaSelection

  const isEditingPocketContents = useMemo<boolean>(() => {
    return (
      isInteractive &&
      settings.view.pocketItemsVisible &&
      isDefined(selected) &&
      narrowers.is.pocket(selected) &&
      isDefined(selected.itemId) &&
      editorTabs?.[selected.id] === PocketEditorTabs.contents
    )
  }, [isInteractive, settings.view.pocketItemsVisible, selected, editorTabs])

  useLayoutEffect(() => {
    if (!isInteractive) {
      clearSelection()
      clearHover()
    }
  }, [isInteractive, clearSelection, clearHover])

  const {
    colorSettings: {
      pocketItemColor,
      leatherColor,
      selectionColor,
      stitchHoleColor,
      stitchLineColor,
      strokeColor,
      threadColor,
    },
    stitchingSettings: { stitchHoleLength, stitchHoleThickness, stitchLineThickness },
  } = project

  const selectionOpacities = useMemo<SelectionOpacitiesSchema>(
    () => getSelectionOpacities(selected, subProject, isEditingPocketContents),
    [selected, subProject, isEditingPocketContents],
  )

  const componentStyles = useMemo<DrawAreaComponentStyles>(() => {
    const getBackgroundColor = ({ component, nestingLevel }: DrawAreaComponentStyleParams): string => {
      if (component.type === 'pocket-cluster' && component.children.length === 0) {
        return 'transparent'
      }
      return applyOpacity(
        component.color ?? getComponentColor(leatherColor, nestingLevel),
        selectionOpacities.components[component.id].fill,
      )
    }

    const getBorderColor = ({ component }: DrawAreaComponentStyleParams): string => {
      if (isSelected(component) || isHovered(component)) {
        return applyOpacity(selectionColor, selectionOpacities.components[component.id].stroke)
      }
      return applyOpacity(strokeColor, selectionOpacities.components[component.id].stroke)
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
      getBorderDasharray: ({ component }) => {
        if (component.type === 'pocket-cluster' && component.children.length === 0) {
          return EMPTY_POCKET_CLUSTER_BORDER_DASHARRAY
        }
        return undefined
      },
      getFilter: ({ component }) => {
        return isSelected(component) || isHovered(component) ? `drop-shadow(0px 0px 2px ${selectionColor})` : undefined
      },
    }
  }, [isHovered, isSelected, leatherColor, selectionColor, strokeColor, selectionOpacities])

  const pocketItemStyles = useMemo<DrawAreaPocketItemStyles>(() => {
    const getBackgroundColor = ({ owner }: DrawAreaPocketItemStyleParams): string => {
      return applyOpacity(pocketItemColor, selectionOpacities.pocketItems[owner.id].fill)
    }
    const getStrokeColor = ({ owner }: DrawAreaPocketItemStyleParams): string => {
      return applyOpacity(strokeColor, selectionOpacities.pocketItems[owner.id].stroke)
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
  }, [pocketItemColor, strokeColor, selectionOpacities])

  const holeStyles = useMemo<DrawAreaHoleStyles>(
    () => ({
      getFillColor: ({ hole }) => {
        return isSelected(hole) ? applyOpacity(selectionColor, 0.3) : 'transparent'
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
      return applyOpacity(
        isSelected(stitchLine) || isHovered(stitchLine) ? selectionColor : stitchLineColor,
        selectionOpacities.stitchLines[stitchLine.id].stroke,
      )
    }
    return {
      getLineColor,
      getStitchHoleFootprintColor: (stitchLine) => {
        const color = isSelected(stitchLine) || isHovered(stitchLine) ? selectionColor : stitchLineColor
        const parsed = parse(color)
        if (!isDefined(parsed)) {
          return undefined
        }
        return applyOpacity(
          formatHex8({ ...parsed, alpha: 0.2 }),
          selectionOpacities.stitchLines[stitchLine.id].stroke,
        )
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
        return applyOpacity(
          isSelected(stitchLine) || isHovered(stitchLine) ? selectionColor : stitchHoleColor,
          selectionOpacities.stitchLines[stitchLine.id].stroke,
        )
      },
      getStitchHoleThickness: (stitchLine) => {
        return stitchLine.stitchHoleThickness ?? stitchHoleThickness
      },
      getThreadColor: (stitchLine) => {
        return applyOpacity(threadColor, selectionOpacities.stitchLines[stitchLine.id].stroke)
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
    selectionOpacities,
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
      isShowingPocketItems: settings.view.pocketItemsVisible,
      selection: drawAreaSelection,
      holeStyles,
      componentStyles,
      pocketItemStyles,
      stitchLineStyles,
      exportTextStyles,
      markerStyles,
      exportIdentifiers,
      labelStyles,
    }),
    [
      pocketItemStyles,
      componentStyles,
      drawAreaSelection,
      holeStyles,
      labelStyles,
      stitchLineStyles,
      isInteractive,
      settings.view.pocketItemsVisible,
    ],
  )

  return drawAreaContextValue
}
