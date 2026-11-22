import { useCallback, useMemo, useState } from 'react'

import type { SubProjectSelectionContextValue } from '../contexts/SubProjectSelectionContext'
import type { SubProjectAccessorSchema } from '../schemas/accessors'
import type { HasTypeSchema } from '../schemas/common'
import type { SubProjectItemSchema } from '../schemas/subProject'
import { isDefined } from '../utils/isDefined'
import { narrowers } from '../utils/narrowers'
import { useSubProject } from './useSubProject'

type ComponentSelectionSchema = HasTypeSchema<'component'> & { componentId: string }
type StitchLineSelectionSchema = HasTypeSchema<'stitch-line'> & { stitchLineId: string }
type HoleSelectionSchema = HasTypeSchema<'hole'> & { holeId: string }
type PocketOpeningSelectionSchema = HasTypeSchema<'pocket-opening'> & { openingId: string }
type BindingSelectionSchema = HasTypeSchema<'binding'> & { bindingId: string }

type SelectionSchema =
  | BindingSelectionSchema
  | ComponentSelectionSchema
  | StitchLineSelectionSchema
  | HoleSelectionSchema
  | PocketOpeningSelectionSchema

export const useSubProjectSelection = (): SubProjectSelectionContextValue => {
  const { accessor } = useSubProject()
  const [selectionInternal, setSelectionInternal] = useState<SelectionSchema | undefined>()
  const [hoveredInternal, setHoveredInternal] = useState<SelectionSchema | undefined>()

  const selected = useMemo<SubProjectItemSchema | undefined>(() => {
    return getModelObject(selectionInternal, accessor)
  }, [selectionInternal, accessor])

  const hovered = useMemo<SubProjectItemSchema | undefined>(() => {
    return getModelObject(hoveredInternal, accessor)
  }, [hoveredInternal, accessor])

  const select = useCallback((model: SubProjectItemSchema): void => {
    setSelectionInternal(getSelectionSchema(model))
  }, [])

  const hover = useCallback((model: SubProjectItemSchema): void => {
    setHoveredInternal(getSelectionSchema(model))
  }, [])

  const clearSelection = useCallback((): void => {
    setSelectionInternal(undefined)
  }, [])

  const clearHover = useCallback((): void => {
    setHoveredInternal(undefined)
  }, [])

  const isSelected = useCallback(
    (model: SubProjectItemSchema): boolean => {
      return isDefined(selected) && selected.type === model.type && selected.id === model.id
    },
    [selected],
  )

  const isHovered = useCallback(
    (model: SubProjectItemSchema): boolean => {
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

const getSelectionSchema = (model: SubProjectItemSchema): SelectionSchema | undefined => {
  if (narrowers.is.component(model)) {
    return { type: 'component', componentId: model.id }
  }
  if (narrowers.is.stitchLine(model)) {
    return { type: 'stitch-line', stitchLineId: model.id }
  }
  if (narrowers.is.hole(model)) {
    return { type: 'hole', holeId: model.id }
  }
  if (narrowers.is.pocketOpening(model)) {
    return { type: 'pocket-opening', openingId: model.id }
  }
  if (narrowers.is.binding(model)) {
    return { type: 'binding', bindingId: model.id }
  }
  return undefined
}

const getModelObject = (
  selection: SelectionSchema | undefined,
  accessor: SubProjectAccessorSchema,
): SubProjectItemSchema | undefined => {
  if (!isDefined(selection)) {
    return undefined
  }

  const optional = accessor.optional

  switch (selection.type) {
    case 'binding':
      return optional.binding.byId(selection.bindingId)
    case 'component':
      return optional.component.byId(selection.componentId)
    case 'stitch-line':
      return optional.stitchLine.byId(selection.stitchLineId)
    case 'hole':
      return optional.hole.byId(selection.holeId)
    case 'pocket-opening':
      return optional.pocketOpening.byId(selection.openingId)
  }
}
