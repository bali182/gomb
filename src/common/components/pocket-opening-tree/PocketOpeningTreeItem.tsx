import { IconButton, TreeView } from '@chakra-ui/react'
import { useDraggable } from '@dnd-kit/core'
import { useCallback, type FC, type MouseEvent, type ReactNode } from 'react'
import { PiDotsSixVertical } from 'react-icons/pi'
import { useEditorContext } from '../../contexts/EditorContext'
import { useSubProjectSelectionContext } from '../../contexts/SubProjectSelectionContext'
import { getModelIconByType } from '../../utils/getModelIcon'
import { isDefined } from '../../utils/isDefined'
import { TreeItemVisual } from '../common/tree/TreeItemVisual'
import { useTreeDragAndDropContext } from '../component-tree/TreeDragAndDropContext'
import type { PocketOpeningTreeItemNode } from './types/nodeTypes'

type PocketOpeningTreeItemProps = {
  node: PocketOpeningTreeItemNode
  indexPath: number[]
  renderMenu: (node: PocketOpeningTreeItemNode) => ReactNode
}

export const PocketOpeningTreeItem: FC<PocketOpeningTreeItemProps> = ({ node, indexPath, renderMenu }) => {
  const { opening } = node
  const { isComputing } = useEditorContext()
  const selection = useSubProjectSelectionContext()
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

  return (
    <TreeView.Item
      ref={setNodeRef}
      data-pocket-opening-id={opening.id}
      h="9"
      py="0"
      cursor={isDisabledForActiveDrag ? 'not-allowed' : undefined}
      opacity={isDisabledForActiveDrag ? 0.4 : undefined}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
    >
      <TreeItemVisual
        icon={getModelIconByType(opening.type)}
        isPositioned={false}
        label={<TreeView.ItemText>{opening.name}</TreeView.ItemText>}
        leading={
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
        }
        trailing={renderMenu(node)}
      />
    </TreeView.Item>
  )
}
