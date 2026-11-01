import type { TreeCollection, TreeViewNodeRenderProps, TreeViewSelectionChangeDetails } from '@chakra-ui/react'
import { useCallback, useMemo, type FC, type ReactNode } from 'react'
import {
  SubProjectSelectionContext,
  type SubProjectSelectionContextValue,
} from '../../contexts/SubProjectSelectionContext'
import { isDefined } from '../../utils/isDefined'
import { narrowers } from '../../utils/narrowers'
import { Tree } from '../common/tree/Tree'
import { PocketOpeningTreeItem } from './PocketOpeningTreeItem'
import type { PocketOpeningTreeItemNode, PocketOpeningTreeNode } from './types/nodeTypes'
import { getPocketOpeningNodeId } from './utils/usePocketOpeningTreeCollection'

type PocketOpeningTreeProps = {
  collection: TreeCollection<PocketOpeningTreeNode>
  selection: SubProjectSelectionContextValue
  renderMenu: (node: PocketOpeningTreeItemNode) => ReactNode
}

export const PocketOpeningTree: FC<PocketOpeningTreeProps> = ({ collection, selection, renderMenu }) => {
  const selectedValue = useMemo<string[]>((): string[] => {
    if (isDefined(selection.selected) && narrowers.is.pocketOpening(selection.selected)) {
      return [getPocketOpeningNodeId(selection.selected.id)]
    }
    return []
  }, [selection.selected])
  const handleSelectionChange = useCallback(
    (details: TreeViewSelectionChangeDetails<PocketOpeningTreeNode>): void => {
      const node = details.selectedNodes[0]
      if (isDefined(node) && node.kind === 'pocket-opening') {
        selection.select(node.opening)
      }
    },
    [selection],
  )
  const renderNode = useCallback(
    ({ node, indexPath }: TreeViewNodeRenderProps<PocketOpeningTreeNode>): ReactNode => {
      switch (node.kind) {
        case 'root':
          return null
        case 'pocket-opening':
          return <PocketOpeningTreeItem key={node.id} node={node} indexPath={indexPath} renderMenu={renderMenu} />
      }
    },
    [renderMenu],
  )

  return (
    <SubProjectSelectionContext.Provider value={selection}>
      <Tree<PocketOpeningTreeNode>
        collection={collection}
        selectedValue={selectedValue}
        onSelectionChange={handleSelectionChange}
        renderNode={renderNode}
      />
    </SubProjectSelectionContext.Provider>
  )
}
