import { createContext, useContext } from 'react'
import type { ModelObjectSchema } from '../schemas/modelObject'
import { noop } from '../utils/noop'
import { produce } from '../utils/produce'

export type SubProjectSelectionContextValue = {
  selected: ModelObjectSchema | undefined
  hovered: ModelObjectSchema | undefined

  select: (selection: ModelObjectSchema) => void
  hover: (selection: ModelObjectSchema) => void

  clearSelection: () => void
  clearHover: () => void

  isSelected: (model: ModelObjectSchema) => boolean
  isHovered: (model: ModelObjectSchema) => boolean
}

export const defaultSubProjectSelection: SubProjectSelectionContextValue = {
  selected: undefined,
  hovered: undefined,
  select: noop,
  hover: noop,
  clearSelection: noop,
  clearHover: noop,
  isSelected: produce(false),
  isHovered: produce(false),
}

export const SubProjectSelectionContext = createContext<SubProjectSelectionContextValue>(defaultSubProjectSelection)

export const useSubProjectSelectionContext = () => {
  return useContext(SubProjectSelectionContext)
}
