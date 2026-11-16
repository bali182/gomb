import type { TreeCollection } from '@chakra-ui/react'
import { useCallback, useMemo, type FC, type ReactNode } from 'react'
import {
  SubProjectSelectionContext,
  type SubProjectSelectionContextValue,
} from '../../contexts/SubProjectSelectionContext'
import { isDefined } from '../../utils/isDefined'
import { narrowers } from '../../utils/narrowers'
import { Tree, type TreeNodeRenderProps } from '../common/tree/Tree'
import { BindingTreeItem } from './BindingTreeItem'
import type { BindingTreeItemNode, BindingTreeNode } from './types/nodeTypes'
import { getBindingNodeId } from './utils/useBindingTreeCollection'

type BindingTreeProps = {
  collection: TreeCollection<BindingTreeNode>
  selection: SubProjectSelectionContextValue
  renderMenu: (node: BindingTreeItemNode) => ReactNode
}
export const BindingTree: FC<BindingTreeProps> = ({ collection, selection, renderMenu }) => {
  const selectedValue = useMemo<string[]>(
    () =>
      isDefined(selection.selected) && narrowers.is.binding(selection.selected)
        ? [getBindingNodeId(selection.selected.id)]
        : [],
    [selection.selected],
  )

  const handleSelectionChange = useCallback(
    (nodeIds: string[]): void => {
      const nodeId = nodeIds[0]
      const node = isDefined(nodeId) ? collection.findNode(nodeId) : undefined
      if (isDefined(node) && node.kind === 'binding') {
        selection.select(node.binding)
      }
    },
    [collection, selection],
  )

  const renderNode = useCallback(
    ({ node, onSelect }: TreeNodeRenderProps<BindingTreeNode>): ReactNode => {
      switch (node.kind) {
        case 'root':
          return null
        case 'binding':
          return <BindingTreeItem key={node.id} node={node} onSelect={onSelect} renderMenu={renderMenu} />
      }
    },
    [renderMenu],
  )

  return (
    <SubProjectSelectionContext.Provider value={selection}>
      <Tree<BindingTreeNode>
        collection={collection}
        selection={selectedValue}
        selectionMode="single"
        onSelectionChange={handleSelectionChange}
        renderNode={renderNode}
      />
    </SubProjectSelectionContext.Provider>
  )
}
