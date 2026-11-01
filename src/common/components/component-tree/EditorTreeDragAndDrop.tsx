import {
  DndContext,
  DragOverlay,
  PointerSensor,
  pointerWithin,
  useSensor,
  useSensors,
  type DragCancelEvent,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { useCallback, useMemo, useState, type FC, type ReactNode } from 'react'
import typia from 'typia'
import { useEditorContext } from '../../contexts/EditorContext'
import { useSubProjectOperations } from '../../hooks/useSubProjectOperations'
import { isDefined } from '../../utils/isDefined'
import { TreeDragAndDropContext, type TreeDragAndDropContextValue } from './TreeDragAndDropContext'
import { TreeDragPreview } from './TreeDragPreview'
import type { TreeDragData } from './types/dragDataTypes'
import type { TreeDropData } from './types/dropDataTypes'
import { useTreeDropAnimation } from './utils/useTreeDropAnimation'

type EditorTreeDragAndDropProps = {
  children: ReactNode
}

export const EditorTreeDragAndDrop: FC<EditorTreeDragAndDropProps> = ({ children }) => {
  const { subProject, isComputing, setEditingInputId } = useEditorContext()
  const operations = useSubProjectOperations()
  const [activeDragData, setActiveDragData] = useState<TreeDragData | undefined>(undefined)
  const { dropTargetRectRef, handleDropAnimation } = useTreeDropAnimation()
  const sensors = useSensors(useSensor(PointerSensor))
  const canDragAndDrop = isDefined(subProject) && !isComputing

  const handleDrop = useCallback(
    (dragData: TreeDragData, dropData: TreeDropData): boolean => {
      switch (dropData.kind) {
        case 'component-reorder': {
          if (dragData.kind === 'component') {
            operations.moveComponent(dragData.componentId, dropData.targetParentId, dropData.beforeComponentId)
            return true
          }
          return false
        }
        case 'component-attachment': {
          switch (dragData.kind) {
            case 'component':
              return false
            case 'hole':
              operations.moveHole(dragData.holeId, dropData.componentId)
              return true
            case 'stitch-line':
              operations.moveStitchLineToComponent(dragData.stitchLineId, dropData.componentId)
              return true
          }
        }
        case 'hole-stitch-line': {
          if (dragData.kind === 'stitch-line' && dragData.stitchLineType === 'component-bounds-stitch-line') {
            operations.moveStitchLineToHole(dragData.stitchLineId, dropData.holeId)
            return true
          }
          return false
        }
      }
    },
    [operations],
  )

  const handleDragStart = useCallback(
    ({ active }: DragStartEvent): void => {
      dropTargetRectRef.current = undefined
      if (!canDragAndDrop) {
        return
      }
      const dragData: unknown = active.data.current
      if (typia.is<TreeDragData>(dragData)) {
        setActiveDragData(dragData)
      }
    },
    [canDragAndDrop, dropTargetRectRef],
  )

  const handleDragCancel = useCallback(
    (_event: DragCancelEvent): void => {
      dropTargetRectRef.current = undefined
      setActiveDragData(undefined)
    },
    [dropTargetRectRef],
  )

  const handleDragEnd = useCallback(
    ({ active, over }: DragEndEvent): void => {
      setActiveDragData(undefined)
      dropTargetRectRef.current = undefined
      if (!canDragAndDrop || !isDefined(over)) {
        return
      }
      const dragData: unknown = active.data.current
      const dropData: unknown = over.data.current
      if (!typia.is<TreeDragData>(dragData) || !typia.is<TreeDropData>(dropData)) {
        return
      }
      if (handleDrop(dragData, dropData)) {
        dropTargetRectRef.current = { ...over.rect }
        setEditingInputId(undefined)
      }
    },
    [canDragAndDrop, dropTargetRectRef, handleDrop, setEditingInputId],
  )

  const context = useMemo<TreeDragAndDropContextValue>(
    (): TreeDragAndDropContextValue => ({ activeDragData }),
    [activeDragData],
  )

  return (
    <DndContext
      collisionDetection={pointerWithin}
      onDragCancel={handleDragCancel}
      onDragEnd={handleDragEnd}
      onDragStart={handleDragStart}
      sensors={sensors}
    >
      <TreeDragAndDropContext.Provider value={context}>
        {children}
        <DragOverlay dropAnimation={handleDropAnimation}>
          {isDefined(activeDragData) && isDefined(subProject) && (
            <TreeDragPreview dragData={activeDragData} subProject={subProject} />
          )}
        </DragOverlay>
      </TreeDragAndDropContext.Provider>
    </DndContext>
  )
}
