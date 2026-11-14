import { IconButton } from '@chakra-ui/react'
import { useDraggable } from '@dnd-kit/core'
import { useCallback, type FC, type MouseEvent } from 'react'
import { PiDotsSixVertical } from 'react-icons/pi'
import { useDrawAreaContext } from '../../contexts/DrawAreaContext'
import { useEditorContext } from '../../contexts/EditorContext'
import { isDefined } from '../../utils/isDefined'
import { useTreeDragAndDropContext } from '../component-tree/TreeDragAndDropContext'

import { PocketOpeningTreeItem, type PocketOpeningTreeItemProps } from './PocketOpeningTreeItem'

export type EditorPocketOpeningTreeItemProps = PocketOpeningTreeItemProps & {
  indexPath: number[]
}

export const EditorPocketOpeningTreeItem: FC<EditorPocketOpeningTreeItemProps> = ({ node, indexPath, ...props }) => {
  const { opening } = node
  const { isComputing } = useEditorContext()
  const { selection } = useDrawAreaContext()
  const { activeDragData } = useTreeDragAndDropContext()
  const isActiveOpening = activeDragData?.kind === 'pocket-opening' && activeDragData.openingId === opening.id
  const isDisabledForActiveDrag = isDefined(activeDragData) && !isActiveOpening

  const { attributes, isDragging, listeners, setActivatorNodeRef, setNodeRef } = useDraggable({
    id: node.id,
    disabled: isComputing,
    data: { kind: 'pocket-opening', openingId: opening.id, node, indexPath },
  })

  const handleDragHandleClick = useCallback((event: MouseEvent<HTMLButtonElement>): void => {
    event.stopPropagation()
  }, [])

  const handlePointerEnter = useCallback((): void => {
    selection.hover(opening)
  }, [opening, selection])

  const handlePointerLeave = useCallback((): void => {
    selection.clearHover()
  }, [selection])

  const dragHandle = (
    <IconButton
      {...attributes}
      {...listeners}
      ref={setActivatorNodeRef}
      disabled={isComputing}
      cursor={isDragging ? 'grabbing' : 'grab'}
      size="2xs"
      variant="ghost"
      onClick={handleDragHandleClick}
      _hover={{ bg: 'transparent' }}
    >
      <PiDotsSixVertical />
    </IconButton>
  )

  return (
    <PocketOpeningTreeItem
      {...props}
      node={node}
      dragHandle={dragHandle}
      controlProps={{
        cursor: isDisabledForActiveDrag ? 'not-allowed' : undefined,
        opacity: isDisabledForActiveDrag ? 0.4 : undefined,
        onPointerEnter: handlePointerEnter,
        onPointerLeave: handlePointerLeave,
        ref: setNodeRef,
      }}
    />
  )
}
