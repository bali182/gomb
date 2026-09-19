import { IconButton, TreeView } from '@chakra-ui/react'
import { useDraggable, useDroppable } from '@dnd-kit/core'
import { useCallback, useMemo, type FC, type MouseEvent, type ReactNode } from 'react'
import { PiDotsSixVertical } from 'react-icons/pi'

import { useSubProjectSelectionContext } from '../../contexts/SubProjectSelectionContext'
import { isDefined } from '../../utils/isDefined'
import { DropInsideIndicator } from './ComponentTreeDropIndicators'
import { TreeItemVisual } from './TreeItemVisual'
import type { TreeDragData } from './types/dragDataTypes'
import type { HoleStitchLineDropData } from './types/dropDataTypes'
import type { HoleTreeNode } from './types/nodeTypes'
import { getProjectTreeNodeIcon } from './utils/getProjectTreeNodeIcon'
import { getProjectTreeNodeLabel } from './utils/getProjectTreeNodeLabel'

type HoleTreeItemProps = {
  activeDragData: TreeDragData | undefined
  hasDragAndDrop: boolean
  indexPath: number[]
  node: HoleTreeNode
  renderMenu?: (node: HoleTreeNode) => ReactNode
}

export const HoleTreeItem: FC<HoleTreeItemProps> = ({
  activeDragData,
  hasDragAndDrop,
  indexPath,
  node,
  renderMenu,
}) => {
  const selection = useSubProjectSelectionContext()
  const { hole } = node
  const isActiveHole = activeDragData?.kind === 'hole' && activeDragData.holeId === hole.id
  const canAcceptStitchLine =
    activeDragData?.kind === 'stitch-line' && activeDragData.stitchLineType === 'component-bounds-stitch-line'
  const isDisabledForActiveDrag = isDefined(activeDragData) && !isActiveHole && !canAcceptStitchLine
  const isExpandable = node.children.length > 0

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
    disabled: !hasDragAndDrop,
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
    disabled: !hasDragAndDrop || !canAcceptStitchLine,
    id: `${node.id}:stitch-line`,
  })

  const setTreeNodeRef = useCallback(
    (element: HTMLElement | null): void => {
      setNodeRef(element)
      setDropNodeRef(element)
    },
    [setDropNodeRef, setNodeRef],
  )

  const Icon = getProjectTreeNodeIcon(node)
  const label = getProjectTreeNodeLabel(node)
  const dragHandle = hasDragAndDrop ? (
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
  const dropFeedback = isOver ? <DropInsideIndicator /> : null

  return (
    <TreeView.BranchControl
      cursor={isDisabledForActiveDrag ? 'not-allowed' : undefined}
      opacity={isDisabledForActiveDrag ? 0.4 : undefined}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onKeyDown={(event) => {
        if (!isExpandable && (event.key === 'ArrowRight' || event.key === '*')) {
          event.preventDefault()
        }
      }}
      ref={setTreeNodeRef}
      py="0"
      h="9"
    >
      {hasDragAndDrop && dropFeedback}
      <TreeItemVisual
        icon={Icon}
        isBranch={true}
        isExpandable={isExpandable}
        isPositioned={true}
        label={label}
        leading={dragHandle}
        trailing={renderMenu?.(node)}
      />
    </TreeView.BranchControl>
  )
}
