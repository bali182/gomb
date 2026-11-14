import type { TreeCollection } from '@chakra-ui/react'
import { useCallback, useMemo, type FC, type ReactNode } from 'react'
import {
  SubProjectSelectionContext,
  type SubProjectSelectionContextValue,
} from '../../contexts/SubProjectSelectionContext'
import { isDefined } from '../../utils/isDefined'
import { narrowers } from '../../utils/narrowers'
import { Tree, type TreeNodeRenderProps } from '../common/tree/Tree'
import { ConstraintTreeItem } from './ConstraintTreeItem'
import type { ConstraintTreeItemNode, ConstraintTreeNode } from './types/nodeTypes'
import { getConstraintNodeId } from './utils/useConstraintTreeCollection'

type ConstraintTreeProps = {
  collection: TreeCollection<ConstraintTreeNode>
  selection: SubProjectSelectionContextValue
  renderMenu: (node: ConstraintTreeItemNode) => ReactNode
}
export const ConstraintTree: FC<ConstraintTreeProps> = ({ collection, selection, renderMenu }) => {
  const selectedValue = useMemo<string[]>(
    () =>
      isDefined(selection.selected) && narrowers.is.constraint(selection.selected)
        ? [getConstraintNodeId(selection.selected.id)]
        : [],
    [selection.selected],
  )

  const handleSelectionChange = useCallback(
    (nodeIds: string[]): void => {
      const nodeId = nodeIds[0]
      const node = isDefined(nodeId) ? collection.findNode(nodeId) : undefined
      if (isDefined(node) && node.kind === 'constraint') {
        selection.select(node.constraint)
      }
    },
    [collection, selection],
  )

  const renderNode = useCallback(
    ({ node, onSelect }: TreeNodeRenderProps<ConstraintTreeNode>): ReactNode => {
      switch (node.kind) {
        case 'root':
          return null
        case 'constraint':
          return <ConstraintTreeItem key={node.id} node={node} onSelect={onSelect} renderMenu={renderMenu} />
      }
    },
    [renderMenu],
  )

  return (
    <SubProjectSelectionContext.Provider value={selection}>
      <Tree<ConstraintTreeNode>
        collection={collection}
        selection={selectedValue}
        selectionMode="single"
        onSelectionChange={handleSelectionChange}
        renderNode={renderNode}
      />
    </SubProjectSelectionContext.Provider>
  )
}
