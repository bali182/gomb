import { TreeView, type TreeViewItemProps } from '@chakra-ui/react'
import { useCallback, type FC, type KeyboardEvent, type MouseEvent, type ReactNode, type RefAttributes } from 'react'
import { TreeItemLabel, TreeItemVisual } from '../common/tree/TreeItemVisual'
import { PocketOpeningIcon } from '../pocket-opening-editors/PocketOpeningIcon'
import type { PocketOpeningTreeItemNode } from './types/nodeTypes'

type PocketOpeningTreeItemControlProps = TreeViewItemProps & RefAttributes<HTMLDivElement>

export type PocketOpeningTreeItemProps = {
  node: PocketOpeningTreeItemNode
  defaultPocketOpeningId: string
  isSelectable: boolean
  onSelect: () => void
  controlProps?: PocketOpeningTreeItemControlProps
  dragHandle?: ReactNode
  dropIndicators?: ReactNode
  renderMenu?: (node: PocketOpeningTreeItemNode) => ReactNode
}

export const PocketOpeningTreeItem: FC<PocketOpeningTreeItemProps> = ({
  node,
  isSelectable,
  onSelect,
  controlProps,
  dragHandle,
  dropIndicators,
  renderMenu,
  defaultPocketOpeningId,
}) => {
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
      data-pocket-opening-id={node.opening.id}
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
        icon={<PocketOpeningIcon type={node.opening.type} isDefault={defaultPocketOpeningId === node.opening.id} />}
        isPositioned={false}
        label={
          <TreeView.ItemText asChild>
            <TreeItemLabel>{node.opening.name}</TreeItemLabel>
          </TreeView.ItemText>
        }
        leading={dragHandle}
        trailing={renderMenu?.(node)}
      />
    </TreeView.Item>
  )
}
