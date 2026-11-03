import type {
  TreeCollection,
  TreeViewExpandedChangeDetails,
  TreeViewNodeRenderProps,
  TreeViewSelectionChangeDetails,
} from '@chakra-ui/react'
import { useCallback, useMemo, type FC, type ReactNode } from 'react'
import {
  SubProjectSelectionContext,
  type SubProjectSelectionContextValue,
} from '../../contexts/SubProjectSelectionContext'
import { isDefined } from '../../utils/isDefined'
import { narrowers } from '../../utils/narrowers'
import { Tree } from '../common/tree/Tree'
import { ComponentTreeItem } from './ComponentTreeItem'
import { HoleTreeItem } from './HoleTreeItem'
import { StitchLineTreeItem } from './StitchLineTreeItem'
import type { ProjectTreeNode } from './types/nodeTypes'
import { getComponentNodeId, getHoleNodeId, getStitchLineNodeId } from './utils/treeNodeIds'

export type ComponentTreeProps = {
  expandedNodeIds: string[]
  collection: TreeCollection<ProjectTreeNode>
  selection: SubProjectSelectionContextValue
  hasDragAndDrop: boolean
  renderMenu?: (node: ProjectTreeNode) => ReactNode
  setExpandedNodeIds: (nodeIds: string[]) => void
}

export const ComponentTree: FC<ComponentTreeProps> = ({
  collection,
  expandedNodeIds,
  hasDragAndDrop,
  renderMenu,
  selection,
  setExpandedNodeIds,
}) => {
  const selectedValue = useMemo<string[]>((): string[] => {
    if (!isDefined(selection.selected)) {
      return []
    }
    if (narrowers.is.component(selection.selected)) {
      return [getComponentNodeId(selection.selected.id)]
    }
    if (narrowers.is.stitchLine(selection.selected)) {
      return [getStitchLineNodeId(selection.selected.id)]
    }
    if (narrowers.is.hole(selection.selected)) {
      return [getHoleNodeId(selection.selected.id)]
    }
    return []
  }, [selection.selected])

  const handleExpandedChange = useCallback(
    (details: TreeViewExpandedChangeDetails<ProjectTreeNode>): void => {
      setExpandedNodeIds(details.expandedValue)
    },
    [setExpandedNodeIds],
  )

  const handleSelectionChange = useCallback(
    (details: TreeViewSelectionChangeDetails<ProjectTreeNode>): void => {
      const selectedNode = details.selectedNodes[0]
      if (!isDefined(selectedNode)) {
        return
      }
      switch (selectedNode.kind) {
        case 'component':
          return selection.select(selectedNode.component)
        case 'stitch-line':
          return selection.select(selectedNode.stitchLine)
        case 'hole':
          return selection.select(selectedNode.hole)
      }
    },
    [selection],
  )

  const renderNode = useCallback(
    ({ indexPath, node, nodeState }: TreeViewNodeRenderProps<ProjectTreeNode>): ReactNode => {
      switch (node.kind) {
        case 'component':
          return (
            <ComponentTreeItem
              indexPath={indexPath}
              node={node}
              nodeState={nodeState}
              hasDragAndDrop={hasDragAndDrop}
              renderMenu={renderMenu}
            />
          )
        case 'hole':
          return (
            <HoleTreeItem hasDragAndDrop={hasDragAndDrop} indexPath={indexPath} node={node} renderMenu={renderMenu} />
          )
        case 'stitch-line':
          return (
            <StitchLineTreeItem
              hasDragAndDrop={hasDragAndDrop}
              indexPath={indexPath}
              node={node}
              renderMenu={renderMenu}
            />
          )
      }
    },
    [hasDragAndDrop, renderMenu],
  )

  return (
    <SubProjectSelectionContext.Provider value={selection}>
      <Tree<ProjectTreeNode>
        collection={collection}
        expandedValue={expandedNodeIds}
        onExpandedChange={handleExpandedChange}
        onSelectionChange={handleSelectionChange}
        selectedValue={selectedValue}
        renderNode={renderNode}
      />
    </SubProjectSelectionContext.Provider>
  )
}
