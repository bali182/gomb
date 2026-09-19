import { IconButton, TreeView } from '@chakra-ui/react'
import { useDraggable } from '@dnd-kit/core'
import { useCallback, type FC, type MouseEvent, type ReactNode } from 'react'
import { PiDotsSixVertical } from 'react-icons/pi'

import { useSubProjectSelectionContext } from '../../contexts/SubProjectSelectionContext'
import { TreeItemVisual } from './TreeItemVisual'
import type { TreeDragData } from './types/dragDataTypes'
import type { StitchLineTreeNode } from './types/nodeTypes'
import { getProjectTreeNodeIcon } from './utils/getProjectTreeNodeIcon'
import { getProjectTreeNodeLabel } from './utils/getProjectTreeNodeLabel'

type StitchLineTreeItemProps = {
  activeDragData: TreeDragData | undefined
  hasDragAndDrop: boolean
  indexPath: number[]
  node: StitchLineTreeNode
  renderMenu?: (node: StitchLineTreeNode) => ReactNode
}

export const StitchLineTreeItem: FC<StitchLineTreeItemProps> = ({
  activeDragData,
  hasDragAndDrop,
  indexPath,
  node,
  renderMenu,
}) => {
  const selection = useSubProjectSelectionContext()
  const { stitchLine } = node
  const isActiveStitchLine = activeDragData?.kind === 'stitch-line' && activeDragData.stitchLineId === stitchLine.id
  const isDisabledForActiveDrag = activeDragData !== undefined && !isActiveStitchLine
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
    disabled: !hasDragAndDrop,
    id: node.id,
  })

  return (
    <TreeView.Item
      cursor={isDisabledForActiveDrag ? 'not-allowed' : undefined}
      opacity={isDisabledForActiveDrag ? 0.4 : undefined}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      ref={setNodeRef}
      py="0"
      h="9"
    >
      <TreeItemVisual
        icon={getProjectTreeNodeIcon(node)}
        isBranch={false}
        isExpandable={false}
        isPositioned={false}
        label={getProjectTreeNodeLabel(node)}
        leading={
          hasDragAndDrop ? (
            <IconButton
              {...attributes}
              {...listeners}
              cursor={isDragging ? 'grabbing' : 'grab'}
              onClick={handleDragHandleClick}
              ref={setActivatorNodeRef}
              size="2xs"
              variant="ghost"
              _hover={{ bg: 'transparent' }}
            >
              <PiDotsSixVertical />
            </IconButton>
          ) : null
        }
        trailing={renderMenu?.(node)}
      />
    </TreeView.Item>
  )
}
