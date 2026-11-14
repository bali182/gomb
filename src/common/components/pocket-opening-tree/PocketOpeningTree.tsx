import type { TreeCollection } from '@chakra-ui/react'
import { useCallback, type FC, type ReactNode } from 'react'
import { Tree, type TreeNodeRenderProps } from '../common/tree/Tree'
import { EditorPocketOpeningTreeItem } from './EditorPocketOpeningTreeItem'
import { PocketOpeningTreeItem } from './PocketOpeningTreeItem'
import type { PocketOpeningTreeItemNode, PocketOpeningTreeNode } from './types/nodeTypes'

type PocketOpeningTreeProps = {
  collection: TreeCollection<PocketOpeningTreeNode>
  selection: string[]
  onSelectionChange: (selection: string[]) => void
  selectionMode: 'single' | 'multiple'
  isNodeSelectable?: (node: PocketOpeningTreeNode) => boolean
  defaultPocketOpeningId: string
  hasDragAndDrop: boolean
  renderMenu?: (node: PocketOpeningTreeItemNode) => ReactNode
}

export const PocketOpeningTree: FC<PocketOpeningTreeProps> = ({
  collection,
  selection,
  onSelectionChange,
  selectionMode,
  isNodeSelectable,
  defaultPocketOpeningId,
  hasDragAndDrop,
  renderMenu,
}) => {
  const renderNode = useCallback(
    ({ node, indexPath, isSelectable, onSelect }: TreeNodeRenderProps<PocketOpeningTreeNode>): ReactNode => {
      switch (node.kind) {
        case 'root':
          return null
        case 'pocket-opening':
          return hasDragAndDrop ? (
            <EditorPocketOpeningTreeItem
              node={node}
              indexPath={indexPath}
              isSelectable={isSelectable}
              onSelect={onSelect}
              defaultPocketOpeningId={defaultPocketOpeningId}
              renderMenu={renderMenu}
            />
          ) : (
            <PocketOpeningTreeItem
              node={node}
              isSelectable={isSelectable}
              onSelect={onSelect}
              defaultPocketOpeningId={defaultPocketOpeningId}
              renderMenu={renderMenu}
            />
          )
      }
    },
    [defaultPocketOpeningId, hasDragAndDrop, renderMenu],
  )
  return (
    <Tree<PocketOpeningTreeNode>
      collection={collection}
      selection={selection}
      onSelectionChange={onSelectionChange}
      selectionMode={selectionMode}
      isNodeSelectable={isNodeSelectable}
      renderNode={renderNode}
    />
  )
}
