import { Box, IconButton, TreeView, type TreeViewNodeState } from '@chakra-ui/react'
import { useDraggable, useDroppable } from '@dnd-kit/core'
import { useCallback, useMemo, type FC, type MouseEvent, type ReactNode } from 'react'
import { PiDotsSixVertical } from 'react-icons/pi'
import { narrowers } from '../../utils/narrowers'

import { useEditorContext } from '../../contexts/EditorContext'
import { useSubProjectSelectionContext } from '../../contexts/SubProjectSelectionContext'
import { useSubProject } from '../../hooks/useSubProject'
import { canAddHole, canAddStitchLine, canMoveComponent } from '../../operations/subProject/utils/componentRules'
import { isDefined } from '../../utils/isDefined'
import { TreeBranchTrigger } from '../common/tree/TreeBranchTrigger'
import { TreeItemVisual } from '../common/tree/TreeItemVisual'
import { DropInsideIndicator, ReorderDropIndicator } from './ComponentTreeDropIndicators'
import { useTreeDragAndDropContext } from './TreeDragAndDropContext'
import type {
  ComponentAttachmentDropData,
  ComponentReorderDropData,
  ComponentTreeDropPosition,
} from './types/dropDataTypes'
import { ComponentTreeNode } from './types/nodeTypes'
import { getProjectTreeNodeIcon } from './utils/getProjectTreeNodeIcon'
import { getProjectTreeNodeLabel } from './utils/getProjectTreeNodeLabel'

type ComponentTreeItemProps = {
  hasDragAndDrop: boolean
  indexPath: number[]
  node: ComponentTreeNode
  nodeState: TreeViewNodeState
  renderMenu?: (node: ComponentTreeNode) => ReactNode
}

export const ComponentTreeItem: FC<ComponentTreeItemProps> = ({
  hasDragAndDrop,
  indexPath,
  node,
  nodeState,
  renderMenu,
}) => {
  const { activeDragData } = useTreeDragAndDropContext()
  const selection = useSubProjectSelectionContext()
  const { isComputing } = useEditorContext()
  const { subProject } = useSubProject()
  const { component } = node
  const isActiveComponent = activeDragData?.kind === 'component' && activeDragData.componentId === component.id
  const isDraggable = hasDragAndDrop && !narrowers.is.rootPanel(component) && !narrowers.is.frontPocket(component)
  const canReorder = hasDragAndDrop && (!isDefined(activeDragData) || activeDragData.kind === 'component')
  const isExpandable = node.children.length > 0

  const handleDragHandleClick = useCallback((event: MouseEvent<HTMLButtonElement>): void => {
    event.stopPropagation()
  }, [])

  const handlePointerEnter = useCallback((): void => {
    selection.hover(component)
  }, [component, selection])

  const handlePointerLeave = useCallback((): void => {
    selection.clearHover()
  }, [selection])

  const canAcceptAttachment = useMemo<boolean>(() => {
    if (!hasDragAndDrop || !isDefined(activeDragData)) {
      return false
    }
    switch (activeDragData.kind) {
      case 'component':
        return false
      case 'hole':
        return canAddHole(component)
      case 'stitch-line':
        return canAddStitchLine(component, subProject, activeDragData.stitchLineType)
    }
  }, [activeDragData, component, hasDragAndDrop, subProject])

  const isDisabledForActiveDrag = useMemo<boolean>(() => {
    if (!isDefined(activeDragData) || isActiveComponent) {
      return false
    }
    switch (activeDragData.kind) {
      case 'component':
        return false
      case 'hole':
        return false
      case 'stitch-line':
        return !canAddStitchLine(component, subProject, activeDragData.stitchLineType)
    }
  }, [activeDragData, component, isActiveComponent, subProject])

  const insideBeforeComponentId = useMemo<string | undefined>(() => {
    if (!narrowers.is.pocketCluster(component)) {
      return undefined
    }
    if (activeDragData?.kind === 'component') {
      return component.children.find((childId) => childId !== activeDragData.componentId)
    }
    return component.children[0]
  }, [component, activeDragData])

  const dropPositions = useMemo<ComponentTreeDropPosition[]>(() => {
    if (narrowers.is.rootPanel(component)) {
      return ['inside']
    }
    const positions: ComponentTreeDropPosition[] = nodeState.expanded
      ? ['before', 'inside']
      : ['before', 'inside', 'after']
    return positions.filter((position) => {
      if (activeDragData?.kind !== 'component') {
        return true
      }
      if (position === 'after' && narrowers.is.frontPocket(component)) {
        return false
      }
      return canMoveComponent(subProject, {
        componentId: activeDragData.componentId,
        targetParentId: position === 'inside' ? component.id : (node.parentId ?? component.id),
        beforeComponentId:
          position === 'before' ? component.id : position === 'after' ? node.nextSiblingId : insideBeforeComponentId,
      })
    })
  }, [
    component,
    nodeState.expanded,
    activeDragData,
    subProject,
    node.parentId,
    node.nextSiblingId,
    insideBeforeComponentId,
  ])

  const { attributes, isDragging, listeners, setActivatorNodeRef, setNodeRef } = useDraggable({
    data: {
      componentId: component.id,
      indexPath,
      kind: 'component',
      node,
    },
    disabled: !isDraggable || isComputing,
    id: node.id,
  })

  const attachmentDropData = useMemo<ComponentAttachmentDropData>(
    () => ({
      componentId: component.id,
      kind: 'component-attachment',
    }),
    [component.id],
  )

  const beforeDropData = useMemo<ComponentReorderDropData>(
    () => ({
      beforeComponentId: component.id,
      kind: 'component-reorder',
      targetParentId: node.parentId ?? component.id,
    }),
    [component.id, node.parentId],
  )

  const afterDropData = useMemo<ComponentReorderDropData>(
    () => ({
      beforeComponentId: node.nextSiblingId,
      kind: 'component-reorder',
      targetParentId: node.parentId ?? component.id,
    }),
    [component.id, node.nextSiblingId, node.parentId],
  )

  const insideDropData = useMemo<ComponentReorderDropData>(
    () => ({
      beforeComponentId: insideBeforeComponentId,
      kind: 'component-reorder',
      targetParentId: component.id,
    }),
    [component.id, insideBeforeComponentId],
  )

  const { isOver: isAttachmentDropOver, setNodeRef: setAttachmentDropNodeRef } = useDroppable({
    data: attachmentDropData,
    disabled: !hasDragAndDrop || !canAcceptAttachment,
    id: `${node.id}:attachment`,
  })

  const { isOver: isBeforeDropAreaOver, setNodeRef: setBeforeDropAreaNodeRef } = useDroppable({
    data: beforeDropData,
    disabled: !hasDragAndDrop || !canReorder || !dropPositions.includes('before'),
    id: `${node.id}:before`,
  })

  const { isOver: isAfterDropAreaOver, setNodeRef: setAfterDropAreaNodeRef } = useDroppable({
    data: afterDropData,
    disabled: !hasDragAndDrop || !canReorder || !dropPositions.includes('after'),
    id: `${node.id}:after`,
  })

  const { isOver: isInsideDropAreaOver, setNodeRef: setInsideDropAreaNodeRef } = useDroppable({
    data: insideDropData,
    disabled: !hasDragAndDrop || !canReorder || !dropPositions.includes('inside'),
    id: `${node.id}:inside`,
  })

  const setTreeNodeRef = useCallback(
    (element: HTMLElement | null): void => {
      setNodeRef(element)
      setAttachmentDropNodeRef(element)
    },
    [setAttachmentDropNodeRef, setNodeRef],
  )

  const Icon = getProjectTreeNodeIcon(node, subProject)
  const dragHandle = hasDragAndDrop ? (
    <IconButton
      {...attributes}
      {...listeners}
      cursor={isDragging ? 'grabbing' : 'grab'}
      disabled={!isDraggable || isComputing}
      onClick={handleDragHandleClick}
      ref={setActivatorNodeRef}
      size="2xs"
      variant="ghost"
      _hover={{ bg: 'transparent' }}
    >
      <PiDotsSixVertical />
    </IconButton>
  ) : null
  const dropAreaRefs = {
    after: setAfterDropAreaNodeRef,
    before: setBeforeDropAreaNodeRef,
    inside: setInsideDropAreaNodeRef,
  }
  const dropAreas = (
    <Box display="flex" flexDirection="column" inset="0" pointerEvents="none" position="absolute" ref={setTreeNodeRef}>
      {canReorder &&
        dropPositions.map((position) => (
          <Box key={position} flex="1" pointerEvents="none" ref={dropAreaRefs[position]} />
        ))}
    </Box>
  )

  const insideDropAreaFeedback = isInsideDropAreaOver || isAttachmentDropOver ? <DropInsideIndicator /> : null

  const insertionIndicators = (
    <>
      {isBeforeDropAreaOver && <ReorderDropIndicator position="before" />}
      {isAfterDropAreaOver && <ReorderDropIndicator position="after" />}
    </>
  )

  return (
    <TreeView.BranchControl
      cursor={isDisabledForActiveDrag ? 'not-allowed' : undefined}
      opacity={isDisabledForActiveDrag ? 0.4 : undefined}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onKeyDown={(event) => {
        if (!isExpandable && (event.key === 'ArrowRight' || event.key === '*')) {
          event.preventDefault()
        }
      }}
      py="0"
      h="9"
    >
      {hasDragAndDrop && dropAreas}
      {hasDragAndDrop && insideDropAreaFeedback}
      {hasDragAndDrop && insertionIndicators}
      <TreeItemVisual
        icon={Icon}
        trigger={<TreeBranchTrigger isExpandable={isExpandable} />}
        isPositioned={true}
        label={<TreeView.BranchText>{getProjectTreeNodeLabel(node)}</TreeView.BranchText>}
        leading={dragHandle}
        trailing={renderMenu?.(node)}
      />
    </TreeView.BranchControl>
  )
}
