import { TreeView, type TreeViewBranchControlProps } from '@chakra-ui/react'
import { useCallback, type FC, type KeyboardEvent, type MouseEvent, type ReactNode, type RefAttributes } from 'react'
import { getModelIconByType } from '../../utils/getModelIcon'
import { TreeBranchTrigger } from '../common/tree/TreeBranchTrigger'
import { TreeItemLabel, TreeItemVisual } from '../common/tree/TreeItemVisual'
import type { HoleTreeNode } from './types/nodeTypes'
import { getProjectTreeNodeLabel } from './utils/getProjectTreeNodeLabel'

type HoleTreeItemControlProps = TreeViewBranchControlProps & RefAttributes<HTMLDivElement>

export type HoleTreeItemProps = {
  node: HoleTreeNode
  isSelectable: boolean
  onSelect: () => void
  controlProps?: HoleTreeItemControlProps
  dragHandle?: ReactNode
  dropIndicators?: ReactNode
  renderMenu?: (node: HoleTreeNode) => ReactNode
}

export const HoleTreeItem: FC<HoleTreeItemProps> = ({
  node,
  isSelectable,
  onSelect,
  controlProps,
  dragHandle,
  dropIndicators,
  renderMenu,
}) => {
  const Icon = getModelIconByType(node.hole.type)
  const isExpandable = node.children.length > 0

  const handleClick = useCallback(
    (event: MouseEvent<HTMLDivElement>): void => {
      event.stopPropagation()
      onSelect()
    },
    [onSelect],
  )

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>): void => {
      if (event.target !== event.currentTarget) {
        return
      }
      if (event.key === ' ' || event.key === 'Enter') {
        event.preventDefault()
        event.stopPropagation()
        onSelect()
      }
      if (!isExpandable && (event.key === 'ArrowRight' || event.key === '*')) {
        event.preventDefault()
      }
    },
    [isExpandable, onSelect],
  )

  return (
    <TreeView.BranchControl
      {...controlProps}
      aria-disabled={!isSelectable}
      opacity={!isSelectable ? 0.4 : controlProps?.opacity}
      cursor={!isSelectable ? 'not-allowed' : controlProps?.cursor}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      py="0"
      h="9"
    >
      {dropIndicators}
      <TreeItemVisual
        icon={<Icon />}
        trigger={<TreeBranchTrigger isExpandable={isExpandable} />}
        isPositioned={true}
        label={
          <TreeView.BranchText asChild>
            <TreeItemLabel>{getProjectTreeNodeLabel(node)}</TreeItemLabel>
          </TreeView.BranchText>
        }
        leading={dragHandle}
        trailing={renderMenu?.(node)}
      />
    </TreeView.BranchControl>
  )
}
