import { TreeView as ArkTreeView } from '@ark-ui/react'
import {
  IconButton,
  TreeView,
  type TreeCollection,
  type TreeViewExpandedChangeDetails,
  type TreeViewSelectionChangeDetails,
} from '@chakra-ui/react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  pointerWithin,
  useSensor,
  useSensors,
  type DragCancelEvent,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { useCallback, useMemo, useState, type FC, type ReactNode } from 'react'
import { PiDotsSixVertical } from 'react-icons/pi'

import typia from 'typia'
import {
  SubProjectSelectionContext,
  type SubProjectSelectionContextValue,
} from '../../contexts/SubProjectSelectionContext'
import type { UseSubProjectOperationsOutput } from '../../hooks/useSubProjectOperations'
import { isDefined } from '../../utils/isDefined'
import { narrowers } from '../../utils/narrowers'
import { ComponentTreeItem } from './ComponentTreeItem'
import { HoleTreeItem } from './HoleTreeItem'
import { StitchLineTreeItem } from './StitchLineTreeItem'
import { TreeItemVisual } from './TreeItemVisual'
import { TreeDragData } from './types/dragDataTypes'
import { TreeDropData } from './types/dropDataTypes'
import { ProjectTreeNode } from './types/nodeTypes'
import { getProjectTreeNodeIcon } from './utils/getProjectTreeNodeIcon'
import { getProjectTreeNodeLabel } from './utils/getProjectTreeNodeLabel'
import { getComponentNodeId, getHoleNodeId, getStitchLineNodeId } from './utils/treeNodeIds'
import { useTreeDropAnimation } from './utils/useTreeDropAnimation'

export type ComponentTreeProps = {
  expandedNodeIds: string[]
  collection: TreeCollection<ProjectTreeNode>
  operations?: UseSubProjectOperationsOutput
  selection: SubProjectSelectionContextValue
  hasDragAndDrop: boolean
  renderMenu?: (node: ProjectTreeNode) => ReactNode
  setExpandedNodeIds: (nodeIds: string[]) => void
}

export const ComponentTree: FC<ComponentTreeProps> = ({
  collection,
  expandedNodeIds,
  hasDragAndDrop,
  operations,
  renderMenu,
  selection,
  setExpandedNodeIds,
}) => {
  const [activeDragData, setActiveDragData] = useState<TreeDragData | undefined>()
  const { dropTargetRectRef, handleDropAnimation } = useTreeDropAnimation()
  const sensors = useSensors(useSensor(PointerSensor))

  const selectedValue = useMemo((): string[] => {
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

  const handleDragStart = useCallback(
    ({ active }: DragStartEvent): void => {
      dropTargetRectRef.current = undefined

      const dragData: unknown = active.data.current

      if (typia.is<TreeDragData>(dragData)) {
        setActiveDragData(dragData)
      }
    },
    [dropTargetRectRef],
  )

  const handleDragCancel = useCallback(
    (_event: DragCancelEvent): void => {
      dropTargetRectRef.current = undefined
      setActiveDragData(undefined)
    },
    [dropTargetRectRef],
  )

  const handleDragEnd = useCallback(
    ({ active, over }: DragEndEvent): void => {
      setActiveDragData(undefined)

      if (!isDefined(over) || !isDefined(operations)) {
        return
      }

      const dragData = active.data.current
      const dropData = over.data.current

      if (!typia.is<TreeDragData>(dragData) || !typia.is<TreeDropData>(dropData)) {
        return
      }

      dropTargetRectRef.current = { ...over.rect }

      switch (dropData.kind) {
        case 'component-reorder': {
          if (dragData.kind === 'component') {
            operations.moveComponent(dragData.componentId, dropData.targetParentId, dropData.beforeComponentId)
          }
          break
        }
        case 'component-attachment': {
          switch (dragData.kind) {
            case 'hole': {
              operations.moveHole(dragData.holeId, dropData.componentId)
              break
            }
            case 'stitch-line': {
              operations.moveStitchLineToComponent(dragData.stitchLineId, dropData.componentId)
              break
            }
          }
          break
        }
        case 'hole-stitch-line': {
          if (dragData.kind === 'stitch-line' && dragData.stitchLineType === 'component-bounds-stitch-line') {
            operations.moveStitchLineToHole(dragData.stitchLineId, dropData.holeId)
          }
          break
        }
      }
    },
    [dropTargetRectRef, operations],
  )

  return (
    <SubProjectSelectionContext.Provider value={selection}>
      <DndContext
        collisionDetection={pointerWithin}
        onDragCancel={handleDragCancel}
        onDragEnd={handleDragEnd}
        onDragStart={handleDragStart}
        sensors={sensors}
      >
        <TreeView.Root
          collection={collection}
          expandedValue={expandedNodeIds}
          expandOnClick={false}
          onExpandedChange={handleExpandedChange}
          onSelectionChange={handleSelectionChange}
          selectedValue={selectedValue}
          selectionMode="single"
        >
          <TreeView.Tree>
            <TreeView.Node<ProjectTreeNode>
              indentGuide={<TreeView.BranchIndentGuide />}
              render={({ indexPath, node, nodeState }) => {
                switch (node.kind) {
                  case 'component':
                    return (
                      <ComponentTreeItem
                        activeDragData={activeDragData}
                        indexPath={indexPath}
                        node={node}
                        nodeState={nodeState}
                        hasDragAndDrop={hasDragAndDrop}
                        renderMenu={renderMenu}
                      />
                    )
                  case 'hole':
                    return (
                      <HoleTreeItem
                        activeDragData={activeDragData}
                        hasDragAndDrop={hasDragAndDrop}
                        indexPath={indexPath}
                        node={node}
                        renderMenu={renderMenu}
                      />
                    )
                  case 'stitch-line':
                    return (
                      <StitchLineTreeItem
                        activeDragData={activeDragData}
                        hasDragAndDrop={hasDragAndDrop}
                        indexPath={indexPath}
                        node={node}
                        renderMenu={renderMenu}
                      />
                    )
                }
              }}
            />
          </TreeView.Tree>
          {hasDragAndDrop && (
            <DragOverlay dropAnimation={handleDropAnimation}>
              {isDefined(activeDragData) && <TreeDragPreview dragData={activeDragData} />}
            </DragOverlay>
          )}
        </TreeView.Root>
      </DndContext>
    </SubProjectSelectionContext.Provider>
  )
}

type TreeDragPreviewProps = {
  dragData: TreeDragData
}

const TreeDragPreview: FC<TreeDragPreviewProps> = ({ dragData }) => {
  const { node } = dragData
  const isBranch = node.kind !== 'stitch-line'
  const isExpandable = node.children.length > 0
  const dragHandle = (
    <IconButton pointerEvents="none" size="2xs" variant="ghost" _hover={{ bg: 'transparent' }}>
      <PiDotsSixVertical />
    </IconButton>
  )
  const isPositioned = node.kind !== 'stitch-line'

  const visual = (
    <TreeItemVisual
      icon={getProjectTreeNodeIcon(node)}
      isBranch={isBranch}
      isExpandable={isExpandable}
      isPositioned={isPositioned}
      label={getProjectTreeNodeLabel(node)}
      leading={dragHandle}
      trailing={null}
    />
  )

  return (
    <TreeView.Tree aria-hidden="true" height="100%" pointerEvents="none" width="100%">
      <ArkTreeView.NodeProvider indexPath={dragData.indexPath} node={node}>
        {isBranch ? (
          <TreeView.Branch>
            <TreeView.BranchControl bg="bg.info/90" h="9" py="0">
              {visual}
            </TreeView.BranchControl>
          </TreeView.Branch>
        ) : (
          <TreeView.Item bg="bg.info/90" h="9" py="0">
            {visual}
          </TreeView.Item>
        )}
      </ArkTreeView.NodeProvider>
    </TreeView.Tree>
  )
}
