import { createContext, useContext } from 'react'
import type { SubProjectItemSchema } from '../schemas/subProject'
import { noop } from '../utils/noop'
import { produce } from '../utils/produce'

export type SubProjectSelectionContextValue = {
  selected: SubProjectItemSchema | undefined
  hovered: SubProjectItemSchema | undefined

  select: (selection: SubProjectItemSchema) => void
  hover: (selection: SubProjectItemSchema) => void

  clearSelection: () => void
  clearHover: () => void

  isSelected: (model: SubProjectItemSchema) => boolean
  isHovered: (model: SubProjectItemSchema) => boolean
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
