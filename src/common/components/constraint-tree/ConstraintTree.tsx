import type { TreeCollection, TreeViewNodeRenderProps, TreeViewSelectionChangeDetails } from '@chakra-ui/react'
import { useCallback, useMemo, type FC, type ReactNode } from 'react'
import {
  SubProjectSelectionContext,
  type SubProjectSelectionContextValue,
} from '../../contexts/SubProjectSelectionContext'
import { isDefined } from '../../utils/isDefined'
import { narrowers } from '../../utils/narrowers'
import { Tree } from '../common/tree/Tree'
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
    (details: TreeViewSelectionChangeDetails<ConstraintTreeNode>): void => {
      const node = details.selectedNodes[0]
      if (isDefined(node) && node.kind === 'constraint') {
        selection.select(node.constraint)
      }
    },
    [selection],
  )

  const renderNode = useCallback(
    ({ node }: TreeViewNodeRenderProps<ConstraintTreeNode>): ReactNode => {
      switch (node.kind) {
        case 'root':
          return null
        case 'constraint':
          return <ConstraintTreeItem key={node.id} node={node} renderMenu={renderMenu} />
      }
    },
    [renderMenu],
  )

  return (
    <SubProjectSelectionContext.Provider value={selection}>
      <Tree<ConstraintTreeNode>
        collection={collection}
        selectedValue={selectedValue}
        onSelectionChange={handleSelectionChange}
        renderNode={renderNode}
      />
    </SubProjectSelectionContext.Provider>
  )
}
