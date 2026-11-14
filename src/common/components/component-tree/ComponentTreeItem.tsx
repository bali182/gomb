import { TreeView, type TreeViewBranchControlProps } from '@chakra-ui/react'
import { useCallback, type FC, type KeyboardEvent, type MouseEvent, type ReactNode, type RefAttributes } from 'react'
import { PiCheck } from 'react-icons/pi'
import type { SubProjectSchema } from '../../schemas/subProject'
import type { TreeSelectionMode } from '../common/tree/Tree'
import { TreeBranchTrigger } from '../common/tree/TreeBranchTrigger'
import { TreeItemLabel, TreeItemVisual } from '../common/tree/TreeItemVisual'
import { disabledTreeItemStyles, multipleSelectedTreeItemStyles } from '../common/tree/treeItemStyles'
import type { ComponentTreeNode } from './types/nodeTypes'
import { getProjectTreeNodeIcon } from './utils/getProjectTreeNodeIcon'
import { getProjectTreeNodeLabel } from './utils/getProjectTreeNodeLabel'

type ComponentTreeItemControlProps = TreeViewBranchControlProps & RefAttributes<HTMLDivElement>

export type ComponentTreeItemProps = {
  node: ComponentTreeNode
  subProject: SubProjectSchema
  selectionMode: TreeSelectionMode
  isSelectable: boolean
  onSelect: () => void
  controlProps?: ComponentTreeItemControlProps
  dragHandle?: ReactNode
  dropIndicators?: ReactNode
  renderMenu?: (node: ComponentTreeNode) => ReactNode
}

export const ComponentTreeItem: FC<ComponentTreeItemProps> = ({
  node,
  selectionMode,
  isSelectable,
  onSelect,
  controlProps,
  dragHandle,
  dropIndicators,
  renderMenu,
  subProject,
}) => {
  const Icon = getProjectTreeNodeIcon(node, subProject)
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
      cursor={controlProps?.cursor}
      _selected={selectionMode === 'multiple' ? multipleSelectedTreeItemStyles : undefined}
      _disabled={disabledTreeItemStyles}
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
        trailing={
          selectionMode === 'multiple' ? (
            <TreeView.ItemIndicator>
              <PiCheck />
            </TreeView.ItemIndicator>
          ) : (
            renderMenu?.(node)
          )
        }
      />
    </TreeView.BranchControl>
  )
}
