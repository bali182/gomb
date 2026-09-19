import { useCallback, useMemo, useState } from 'react'

import type { SubProjectSelectionContextValue } from '../contexts/SubProjectSelectionContext'
import type { HasTypeSchema } from '../schemas/common'
import type { ModelObjectSchema } from '../schemas/modelObject'
import type { SubProjectSchema } from '../schemas/subProject'
import { accessors } from '../utils/accessors'
import { isDefined } from '../utils/isDefined'
import { narrowers } from '../utils/narrowers'

type ComponentSelectionSchema = HasTypeSchema<'component'> & { componentId: string }
type StitchLineSelectionSchema = HasTypeSchema<'stitch-line'> & { stitchLineId: string }
type HoleSelectionSchema = HasTypeSchema<'hole'> & { holeId: string }

type SelectionSchema = ComponentSelectionSchema | StitchLineSelectionSchema | HoleSelectionSchema

export const useSubProjectSelection = (subProject: SubProjectSchema): SubProjectSelectionContextValue => {
  const [selectionInternal, setSelectionInternal] = useState<SelectionSchema | undefined>()
  const [hoveredInternal, setHoveredInternal] = useState<SelectionSchema | undefined>()

  const selected = useMemo<ModelObjectSchema | undefined>(() => {
    return getModelObject(selectionInternal, subProject)
  }, [selectionInternal, subProject])

  const hovered = useMemo<ModelObjectSchema | undefined>(() => {
    return getModelObject(hoveredInternal, subProject)
  }, [hoveredInternal, subProject])

  const select = useCallback((model: ModelObjectSchema): void => {
    setSelectionInternal(getSelectionSchema(model))
  }, [])

  const hover = useCallback((model: ModelObjectSchema): void => {
    setHoveredInternal(getSelectionSchema(model))
  }, [])

  const clearSelection = useCallback((): void => {
    setSelectionInternal(undefined)
  }, [])

  const clearHover = useCallback((): void => {
    setHoveredInternal(undefined)
  }, [])

  const isSelected = useCallback(
    (model: ModelObjectSchema): boolean => {
      return isDefined(selected) && selected.type === model.type && selected.id === model.id
    },
    [selected],
  )

  const isHovered = useCallback(
    (model: ModelObjectSchema): boolean => {
      return isDefined(hovered) && hovered.type === model.type && hovered.id === model.id
    },
    [hovered],
  )

  return useMemo<SubProjectSelectionContextValue>(
    () => ({
      selected,
      hovered,
      select,
      hover,
      clearSelection,
      clearHover,
      isSelected,
      isHovered,
    }),
    [hovered, selected, clearHover, clearSelection, hover, isHovered, isSelected, select],
  )
}

const getSelectionSchema = (model: ModelObjectSchema): SelectionSchema | undefined => {
  if (narrowers.is.component(model)) {
    return { type: 'component', componentId: model.id }
  }
  if (narrowers.is.stitchLine(model)) {
    return { type: 'stitch-line', stitchLineId: model.id }
  }
  if (narrowers.is.hole(model)) {
    return { type: 'hole', holeId: model.id }
  }
  return undefined
}

const getModelObject = (
  selection: SelectionSchema | undefined,
  subProject: SubProjectSchema,
): ModelObjectSchema | undefined => {
  if (!isDefined(selection)) {
    return undefined
  }

  const optional = accessors.subProject(subProject).optional

  switch (selection.type) {
    case 'component':
      return optional.component(selection.componentId)
    case 'stitch-line':
      return optional.stitchLine(selection.stitchLineId)
    case 'hole':
      return optional.hole(selection.holeId)
  }
}
