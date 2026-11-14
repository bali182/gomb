import { TreeView, type TreeViewItemProps } from '@chakra-ui/react'
import { useCallback, type FC, type KeyboardEvent, type MouseEvent, type ReactNode, type RefAttributes } from 'react'
import { getModelIconByType } from '../../utils/getModelIcon'
import { TreeItemLabel, TreeItemVisual } from '../common/tree/TreeItemVisual'
import type { StitchLineTreeNode } from './types/nodeTypes'
import { getProjectTreeNodeLabel } from './utils/getProjectTreeNodeLabel'

type StitchLineTreeItemControlProps = TreeViewItemProps & RefAttributes<HTMLDivElement>

export type StitchLineTreeItemProps = {
  node: StitchLineTreeNode
  isSelectable: boolean
  onSelect: () => void
  controlProps?: StitchLineTreeItemControlProps
  dragHandle?: ReactNode
  dropIndicators?: ReactNode
  renderMenu?: (node: StitchLineTreeNode) => ReactNode
}

export const StitchLineTreeItem: FC<StitchLineTreeItemProps> = ({
  node,
  isSelectable,
  onSelect,
  controlProps,
  dragHandle,
  dropIndicators,
  renderMenu,
}) => {
  const Icon = getModelIconByType(node.stitchLine.type)

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
    },
    [onSelect],
  )

  return (
    <TreeView.Item
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
        isPositioned={false}
        label={
          <TreeView.ItemText asChild>
            <TreeItemLabel>{getProjectTreeNodeLabel(node)}</TreeItemLabel>
          </TreeView.ItemText>
        }
        leading={dragHandle}
        trailing={renderMenu?.(node)}
      />
    </TreeView.Item>
  )
}
