import { Box, Icon, IconButton, type TreeViewNodeState } from '@chakra-ui/react'
import { useDraggable, useDroppable } from '@dnd-kit/core'
import { useCallback, useMemo, type FC, type MouseEvent } from 'react'
import { PiDotsSixVertical, PiEyeBold } from 'react-icons/pi'
import { narrowers } from '../../utils/narrowers'

import { useDrawAreaContext } from '../../contexts/DrawAreaContext'
import { useEditorContext } from '../../contexts/EditorContext'
import { canAddHole, canAddStitchLine, canMoveComponent } from '../../operations/subProject/utils/componentRules'
import { isDefined } from '../../utils/isDefined'
import { DropInsideIndicator, ReorderDropIndicator } from './ComponentTreeDropIndicators'
import { useTreeDragAndDropContext } from './TreeDragAndDropContext'
import type {
  ComponentAttachmentDropData,
  ComponentReorderDropData,
  ComponentTreeDropPosition,
} from './types/dropDataTypes'

import { ComponentTreeItem, type ComponentTreeItemProps } from './ComponentTreeItem'
import { getProjectTreeNodeIcon } from './utils/getProjectTreeNodeIcon'

export type EditorComponentTreeItemProps = ComponentTreeItemProps & {
  indexPath: number[]
  nodeState: TreeViewNodeState
}

export const EditorComponentTreeItem: FC<EditorComponentTreeItemProps> = ({
  node,
  indexPath,
  nodeState,
  subProject,
  ...props
}) => {
  const { activeDragData } = useTreeDragAndDropContext()
  const { selection, rootPanelFaceId } = useDrawAreaContext()
  const { isComputing } = useEditorContext()
  const { component } = node
  const ModelIcon = getProjectTreeNodeIcon(node, subProject)
  const isActiveFace = narrowers.is.rootPanelFace(component) && component.id === rootPanelFaceId
  const isActiveComponent = activeDragData?.kind === 'component' && activeDragData.componentId === component.id
  const isDraggable =
    !narrowers.is.rootPanel(component) && !narrowers.is.rootPanelFace(component) && !narrowers.is.frontPocket(component)
  const canReorder = !isDefined(activeDragData) || activeDragData.kind === 'component'

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
    if (!isDefined(activeDragData)) {
      return false
    }
    switch (activeDragData.kind) {
      case 'component':
        return false
      case 'hole':
        return canAddHole(component)
      case 'stitch-line':
        return canAddStitchLine(component, subProject, activeDragData.stitchLineType)
      case 'pocket-opening':
        return node.hasPocketInSubtree
    }
  }, [activeDragData, component, subProject, node.hasPocketInSubtree])

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
      case 'pocket-opening':
        return !node.hasPocketInSubtree
    }
  }, [activeDragData, component, isActiveComponent, subProject, node.hasPocketInSubtree])

  const insideBeforeComponentId = useMemo<string | undefined>(() => {
    if (!narrowers.is.pocketCluster(component)) {
      return undefined
    }
    if (activeDragData?.kind === 'component') {
      return component.children.find((childId) => childId !== activeDragData.componentId)
    }
    return component.children[0]
  }, [component, activeDragData])

  const dropPositionsByType = useMemo<ComponentTreeDropPosition[]>(() => {
    if (narrowers.is.rootPanel(component)) {
      return []
    }
    if (narrowers.is.rootPanelFace(component)) {
      return ['inside']
    }
    return nodeState.expanded ? ['before', 'inside'] : ['before', 'inside', 'after']
  }, [component, nodeState.expanded])

  const dropPositions = useMemo<ComponentTreeDropPosition[]>(() => {
    return dropPositionsByType.filter((position) => {
      if (activeDragData?.kind !== 'component') {
        return true
      }
      if (position === 'after' && narrowers.is.frontPocket(component)) {
        return false
      }
      return canMoveComponent(subProject, {
        id: activeDragData.componentId,
        targetParentId: position === 'inside' ? component.id : (node.parentId ?? component.id),
        beforeComponentId:
          position === 'before' ? component.id : position === 'after' ? node.nextSiblingId : insideBeforeComponentId,
      })
    })
  }, [
    dropPositionsByType,
    component,
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
    disabled: !canAcceptAttachment,
    id: `${node.id}:attachment`,
  })

  const { isOver: isBeforeDropAreaOver, setNodeRef: setBeforeDropAreaNodeRef } = useDroppable({
    data: beforeDropData,
    disabled: !canReorder || !dropPositions.includes('before'),
    id: `${node.id}:before`,
  })

  const { isOver: isAfterDropAreaOver, setNodeRef: setAfterDropAreaNodeRef } = useDroppable({
    data: afterDropData,
    disabled: !canReorder || !dropPositions.includes('after'),
    id: `${node.id}:after`,
  })

  const { isOver: isInsideDropAreaOver, setNodeRef: setInsideDropAreaNodeRef } = useDroppable({
    data: insideDropData,
    disabled: !canReorder || !dropPositions.includes('inside'),
    id: `${node.id}:inside`,
  })

  const setTreeNodeRef = useCallback(
    (element: HTMLElement | null): void => {
      setNodeRef(element)
      setAttachmentDropNodeRef(element)
    },
    [setAttachmentDropNodeRef, setNodeRef],
  )

  const dragHandle = (
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
  )
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
    <ComponentTreeItem
      {...props}
      node={node}
      subProject={subProject}
      icon={
        <Box display="inline-flex" flexShrink="0" position="relative" verticalAlign="middle">
          <Icon as={ModelIcon} size="sm" />
          {isActiveFace && <Icon as={PiEyeBold} position="absolute" bottom="-0.5" right="-1" boxSize="50%" />}
        </Box>
      }
      dropIndicators={
        <>
          {dropAreas}
          {insideDropAreaFeedback}
          {insertionIndicators}
        </>
      }
      dragHandle={dragHandle}
      controlProps={{
        cursor: isDisabledForActiveDrag ? 'not-allowed' : undefined,
        opacity: isDisabledForActiveDrag ? 0.4 : undefined,
        onPointerEnter: handlePointerEnter,
        onPointerLeave: handlePointerLeave,
      }}
    />
  )
}
