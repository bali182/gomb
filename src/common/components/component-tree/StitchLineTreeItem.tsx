import { IconButton, TreeView } from '@chakra-ui/react'
import { useDraggable } from '@dnd-kit/core'
import { useCallback, type FC, type MouseEvent, type ReactNode } from 'react'
import { PiDotsSixVertical } from 'react-icons/pi'
import { getModelIconByType } from '../../utils/getModelIcon'

import { useEditorContext } from '../../contexts/EditorContext'
import { useSubProjectSelectionContext } from '../../contexts/SubProjectSelectionContext'
import { isDefined } from '../../utils/isDefined'
import { TreeItemVisual } from '../common/tree/TreeItemVisual'
import { useTreeDragAndDropContext } from './TreeDragAndDropContext'
import type { StitchLineTreeNode } from './types/nodeTypes'
import { getProjectTreeNodeLabel } from './utils/getProjectTreeNodeLabel'

type StitchLineTreeItemProps = {
  hasDragAndDrop: boolean
  indexPath: number[]
  node: StitchLineTreeNode
  renderMenu?: (node: StitchLineTreeNode) => ReactNode
}

export const StitchLineTreeItem: FC<StitchLineTreeItemProps> = ({ hasDragAndDrop, indexPath, node, renderMenu }) => {
  const { activeDragData } = useTreeDragAndDropContext()
  const selection = useSubProjectSelectionContext()
  const { isComputing } = useEditorContext()
  const { stitchLine } = node
  const Icon = getModelIconByType(stitchLine.type)
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
    disabled: !hasDragAndDrop || isComputing,
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
        icon={<Icon />}
        isPositioned={false}
        label={<TreeView.ItemText>{getProjectTreeNodeLabel(node)}</TreeView.ItemText>}
        leading={
          hasDragAndDrop ? (
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
          ) : null
        }
        trailing={renderMenu?.(node)}
      />
    </TreeView.Item>
  )
}
