import { IconButton } from '@chakra-ui/react'
import { useDraggable, useDroppable } from '@dnd-kit/core'
import { useCallback, useMemo, type FC, type MouseEvent } from 'react'
import { PiDotsSixVertical } from 'react-icons/pi'

import { useDrawAreaContext } from '../../contexts/DrawAreaContext'
import { useEditorContext } from '../../contexts/EditorContext'
import { isDefined } from '../../utils/isDefined'
import { DropInsideIndicator } from './ComponentTreeDropIndicators'
import { useTreeDragAndDropContext } from './TreeDragAndDropContext'
import type { HoleStitchLineDropData } from './types/dropDataTypes'

import { HoleTreeItem, type HoleTreeItemProps } from './HoleTreeItem'

export type EditorHoleTreeItemProps = HoleTreeItemProps & {
  indexPath: number[]
}

export const EditorHoleTreeItem: FC<EditorHoleTreeItemProps> = ({ node, indexPath, ...props }) => {
  const { activeDragData } = useTreeDragAndDropContext()
  const { selection } = useDrawAreaContext()
  const { isComputing } = useEditorContext()
  const { hole } = node
  const isActiveHole = activeDragData?.kind === 'hole' && activeDragData.holeId === hole.id
  const canAcceptStitchLine =
    activeDragData?.kind === 'stitch-line' && activeDragData.stitchLineType === 'component-bounds-stitch-line'
  const isDisabledForActiveDrag = isDefined(activeDragData) && !isActiveHole && !canAcceptStitchLine

  const handleDragHandleClick = useCallback((event: MouseEvent<HTMLButtonElement>): void => {
    event.stopPropagation()
  }, [])

  const handlePointerEnter = useCallback((): void => {
    selection.hover(hole)
  }, [hole, selection])

  const handlePointerLeave = useCallback((): void => {
    selection.clearHover()
  }, [selection])

  const { attributes, isDragging, listeners, setActivatorNodeRef, setNodeRef } = useDraggable({
    data: {
      holeId: hole.id,
      indexPath,
      kind: 'hole',
      node,
    },
    disabled: isComputing,
    id: node.id,
  })

  const dropData = useMemo<HoleStitchLineDropData>(
    () => ({
      holeId: hole.id,
      kind: 'hole-stitch-line',
    }),
    [hole.id],
  )

  const { isOver, setNodeRef: setDropNodeRef } = useDroppable({
    data: dropData,
    disabled: !canAcceptStitchLine,
    id: `${node.id}:stitch-line`,
  })

  const setTreeNodeRef = useCallback(
    (element: HTMLElement | null): void => {
      setNodeRef(element)
      setDropNodeRef(element)
    },
    [setDropNodeRef, setNodeRef],
  )

  const dragHandle = (
    <IconButton
      {...attributes}
      {...listeners}
      cursor={isDragging ? 'grabbing' : 'grab'}
      disabled={isComputing}
      onClick={handleDragHandleClick}
      ref={setActivatorNodeRef}
      size="2xs"
      variant="ghost"
      _hover={{ bg: 'transparent' }}
    >
      <PiDotsSixVertical />
    </IconButton>
  )
  const dropFeedback = isOver ? <DropInsideIndicator /> : null

  return (
    <HoleTreeItem
      {...props}
      node={node}
      dropIndicators={dropFeedback}
      dragHandle={dragHandle}
      controlProps={{
        cursor: isDisabledForActiveDrag ? 'not-allowed' : undefined,
        opacity: isDisabledForActiveDrag ? 0.4 : undefined,
        onPointerEnter: handlePointerEnter,
        onPointerLeave: handlePointerLeave,
        ref: setTreeNodeRef,
      }}
    />
  )
}
