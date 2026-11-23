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
import { useEditorContext } from '../../contexts/EditorContext'
import { useOptionalSubProject } from '../../hooks/useOptionalSubProject'
import { useSubProjectOperations } from '../../hooks/useSubProjectOperations'
import { isTreeDragData, isTreeDropData } from '../../typia'
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
  const { isComputing, setEditingInputId } = useEditorContext()
  const { subProject, accessor } = useOptionalSubProject()
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
            operations.moveComponent({
              id: dragData.componentId,
              targetParentId: dropData.targetParentId,
              beforeComponentId: dropData.beforeComponentId,
            })
            return true
          }
          return false
        }
        case 'component-attachment': {
          switch (dragData.kind) {
            case 'component':
              return false
            case 'hole':
              operations.moveHole({ id: dragData.holeId, targetComponentId: dropData.componentId })
              return true
            case 'stitch-line':
              operations.moveStitchLine({
                id: dragData.stitchLineId,
                targetType: 'component',
                targetId: dropData.componentId,
              })
              return true
            case 'pocket-opening': {
              if (!isDefined(accessor)) {
                return false
              }
              const component = accessor.optional.component.byId(dropData.componentId)
              const opening = accessor.optional.pocketOpening.byId(dragData.openingId)
              if (!isDefined(component) || !isDefined(opening)) {
                return false
              }
              operations.attachPocketOpening({ openingId: opening.id, componentId: component.id })
              return true
            }
          }
        }
        case 'hole-stitch-line': {
          if (dragData.kind === 'stitch-line' && dragData.stitchLineType === 'component-bounds-stitch-line') {
            operations.moveStitchLine({ id: dragData.stitchLineId, targetType: 'hole', targetId: dropData.holeId })
            return true
          }
          return false
        }
      }
    },
    [operations, accessor],
  )

  const handleDragStart = useCallback(
    ({ active }: DragStartEvent): void => {
      dropTargetRectRef.current = undefined
      if (!canDragAndDrop) {
        return
      }
      const dragData: unknown = active.data.current
      if (isTreeDragData(dragData)) {
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
      if (!isTreeDragData(dragData) || !isTreeDropData(dropData)) {
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
