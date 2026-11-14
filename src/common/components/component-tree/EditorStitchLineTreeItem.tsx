import { IconButton } from '@chakra-ui/react'
import { useDraggable } from '@dnd-kit/core'
import { useCallback, type FC, type MouseEvent } from 'react'
import { PiDotsSixVertical } from 'react-icons/pi'

import { useDrawAreaContext } from '../../contexts/DrawAreaContext'
import { useEditorContext } from '../../contexts/EditorContext'
import { isDefined } from '../../utils/isDefined'
import { useTreeDragAndDropContext } from './TreeDragAndDropContext'

import { StitchLineTreeItem, type StitchLineTreeItemProps } from './StitchLineTreeItem'

export type EditorStitchLineTreeItemProps = StitchLineTreeItemProps & {
  indexPath: number[]
}

export const EditorStitchLineTreeItem: FC<EditorStitchLineTreeItemProps> = ({ node, indexPath, ...props }) => {
  const { activeDragData } = useTreeDragAndDropContext()
  const { selection } = useDrawAreaContext()
  const { isComputing } = useEditorContext()
  const { stitchLine } = node
  const isActiveStitchLine = activeDragData?.kind === 'stitch-line' && activeDragData.stitchLineId === stitchLine.id
  const isDisabledForActiveDrag = isDefined(activeDragData) && !isActiveStitchLine
  const handleDragHandleClick = useCallback((event: MouseEvent<HTMLButtonElement>): void => {
    event.stopPropagation()
  }, [])
  const handlePointerEnter = useCallback((): void => {
    selection.hover(stitchLine)
  }, [selection, stitchLine])

  const handlePointerLeave = useCallback((): void => {
    selection.clearHover()
  }, [selection])

  const { attributes, isDragging, listeners, setActivatorNodeRef, setNodeRef } = useDraggable({
    data: {
      indexPath,
      kind: 'stitch-line',
      node,
      stitchLineId: stitchLine.id,
      stitchLineType: stitchLine.type,
    },
    disabled: isComputing,
    id: node.id,
  })

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

  return (
    <StitchLineTreeItem
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
