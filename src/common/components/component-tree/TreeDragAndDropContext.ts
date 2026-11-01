import { createContext, useContext } from 'react'
import type { TreeDragData } from './types/dragDataTypes'

export type TreeDragAndDropContextValue = {
  activeDragData: TreeDragData | undefined
}

export const TreeDragAndDropContext = createContext<TreeDragAndDropContextValue>({ activeDragData: undefined })

export const useTreeDragAndDropContext = (): TreeDragAndDropContextValue => useContext(TreeDragAndDropContext)
