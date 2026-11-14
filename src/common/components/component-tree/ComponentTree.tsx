import type { TreeCollection } from '@chakra-ui/react'
import { useCallback, type FC, type ReactNode } from 'react'
import type { SubProjectSchema } from '../../schemas/subProject'
import { Tree, type TreeNodeRenderProps } from '../common/tree/Tree'
import { ComponentTreeItem } from './ComponentTreeItem'
import { EditorComponentTreeItem } from './EditorComponentTreeItem'
import { EditorHoleTreeItem } from './EditorHoleTreeItem'
import { EditorStitchLineTreeItem } from './EditorStitchLineTreeItem'
import { HoleTreeItem } from './HoleTreeItem'
import { StitchLineTreeItem } from './StitchLineTreeItem'
import type { ProjectTreeNode } from './types/nodeTypes'

export type ComponentTreeProps = {
  collection: TreeCollection<ProjectTreeNode>
  subProject: SubProjectSchema
  selection: string[]
  onSelectionChange: (selection: string[]) => void
  selectionMode: 'single' | 'multiple'
  isNodeSelectable?: (node: ProjectTreeNode) => boolean
  expandedNodeIds: string[]
  onExpandedChange: (nodeIds: string[]) => void
  hasDragAndDrop: boolean
  renderMenu?: (node: ProjectTreeNode) => ReactNode
}

export const ComponentTree: FC<ComponentTreeProps> = ({
  collection,
  subProject,
  selection,
  onSelectionChange,
  selectionMode,
  isNodeSelectable,
  expandedNodeIds,
  onExpandedChange,
  hasDragAndDrop,
  renderMenu,
}) => {
  const renderNode = useCallback(
    ({ indexPath, node, nodeState, isSelectable, onSelect }: TreeNodeRenderProps<ProjectTreeNode>): ReactNode => {
      switch (node.kind) {
        case 'component':
          return hasDragAndDrop ? (
            <EditorComponentTreeItem
              node={node}
              indexPath={indexPath}
              nodeState={nodeState}
              subProject={subProject}
              isSelectable={isSelectable}
              onSelect={onSelect}
              renderMenu={renderMenu}
            />
          ) : (
            <ComponentTreeItem
              node={node}
              subProject={subProject}
              isSelectable={isSelectable}
              onSelect={onSelect}
              renderMenu={renderMenu}
            />
          )
        case 'hole':
          return hasDragAndDrop ? (
            <EditorHoleTreeItem
              node={node}
              indexPath={indexPath}
              isSelectable={isSelectable}
              onSelect={onSelect}
              renderMenu={renderMenu}
            />
          ) : (
            <HoleTreeItem node={node} isSelectable={isSelectable} onSelect={onSelect} renderMenu={renderMenu} />
          )
        case 'stitch-line':
          return hasDragAndDrop ? (
            <EditorStitchLineTreeItem
              node={node}
              indexPath={indexPath}
              isSelectable={isSelectable}
              onSelect={onSelect}
              renderMenu={renderMenu}
            />
          ) : (
            <StitchLineTreeItem node={node} isSelectable={isSelectable} onSelect={onSelect} renderMenu={renderMenu} />
          )
      }
    },
    [hasDragAndDrop, renderMenu, subProject],
  )
  return (
    <Tree<ProjectTreeNode>
      collection={collection}
      selection={selection}
      onSelectionChange={onSelectionChange}
      selectionMode={selectionMode}
      isNodeSelectable={isNodeSelectable}
      expandedNodeIds={expandedNodeIds}
      onExpandedChange={onExpandedChange}
      renderNode={renderNode}
    />
  )
}
