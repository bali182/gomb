import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
  type FC,
  type ReactNode,
  type Ref,
} from 'react'

import { useDrawAreaContext } from '../../contexts/DrawAreaContext'
import { useSubProject } from '../../hooks/useSubProject'
import type { HasTargetSchema } from '../../schemas/common'
import { isDefined } from '../../utils/isDefined'
import { narrowers } from '../../utils/narrowers'
import { ComponentActionsMenu } from '../action-menus/ComponentActionsMenu'
import { HoleActionsMenu } from '../action-menus/HoleActionsMenu'
import { StitchLineActionsMenu } from '../action-menus/StitchLineActionsMenu'
import { ComponentTree } from './ComponentTree'
import type { ProjectTreeNode } from './types/nodeTypes'
import { getNextExpandedNodeIds } from './utils/getNextExpandedNodeIds'
import { getComponentNodeId, getHoleNodeId, getStitchLineNodeId } from './utils/treeNodeIds'
import { useComponentTreeCollection } from './utils/useComponentTreeCollection'

export type EditorComponentTreeHandle = {
  collapseAll: () => void
  expandAll: () => void
  expand: (target: HasTargetSchema) => void
}

type EditorComponentTreeProps = {
  ref?: Ref<EditorComponentTreeHandle>
}

export const EditorComponentTree: FC<EditorComponentTreeProps> = ({ ref }) => {
  const { selection } = useDrawAreaContext()
  const { subProject } = useSubProject()
  const [expandedNodeIds, setExpandedNodeIds] = useState<string[]>(() => [getComponentNodeId(subProject.root)])

  const collection = useComponentTreeCollection(subProject, {
    showHoles: true,
    showStitchLines: true,
  })

  const { selected } = selection

  const selectedNodeIds = useMemo<string[]>(() => {
    if (!isDefined(selected)) {
      return []
    }
    if (narrowers.is.component(selected)) {
      return [getComponentNodeId(selected.id)]
    }
    if (narrowers.is.hole(selected)) {
      return [getHoleNodeId(selected.id)]
    }
    if (narrowers.is.stitchLine(selected)) {
      return [getStitchLineNodeId(selected.id)]
    }
    return []
  }, [selected])

  const handleSelectionChange = useCallback(
    (nodeIds: string[]): void => {
      const nodeId = nodeIds[0]
      const node = isDefined(nodeId) ? collection.findNode(nodeId) : undefined
      if (!isDefined(node)) {
        return
      }
      switch (node.kind) {
        case 'component':
          return selection.select(node.component)
        case 'hole':
          return selection.select(node.hole)
        case 'stitch-line':
          return selection.select(node.stitchLine)
      }
    },
    [collection, selection],
  )

  const collapseAll = useCallback((): void => {
    setExpandedNodeIds([])
  }, [])

  const expandAll = useCallback((): void => {
    setExpandedNodeIds(collection.getBranchValues())
  }, [collection])

  useEffect(() => {
    setExpandedNodeIds((currentExpandedNodeIds) => {
      const nextExpandedNodeIds = currentExpandedNodeIds.filter(
        (id) => (collection.findNode(id)?.children?.length ?? 0) > 0,
      )
      return nextExpandedNodeIds.length === currentExpandedNodeIds.length ? currentExpandedNodeIds : nextExpandedNodeIds
    })
  }, [collection])

  useEffect(() => {
    if (isDefined(selected)) {
      setExpandedNodeIds((currentExpandedNodeIds) =>
        getNextExpandedNodeIds(selected, subProject, currentExpandedNodeIds),
      )
    }
  }, [selected, subProject])

  const expand = useCallback(
    (target: HasTargetSchema): void => {
      const targetNodeId =
        target.targetType === 'component' ? getComponentNodeId(target.targetId) : getHoleNodeId(target.targetId)
      const parentNodeIds = collection.getParentNodes(targetNodeId).map((node) => node.id)

      setExpandedNodeIds((currentExpandedNodeIds) =>
        Array.from(new Set([...currentExpandedNodeIds, ...parentNodeIds, targetNodeId])),
      )
    },
    [collection],
  )

  useImperativeHandle(ref, () => ({ collapseAll, expandAll, expand }), [collapseAll, expandAll, expand])

  const handleHoleDelete = useCallback(
    (holeId: string): void => {
      if (selection.selected?.id === holeId) {
        selection.clearSelection()
      }
    },
    [selection],
  )

  const handleStitchLineDelete = useCallback(
    (stitchLineId: string): void => {
      if (selection.selected?.id === stitchLineId) {
        selection.clearSelection()
      }
    },
    [selection],
  )

  const renderMenu = useCallback(
    (node: ProjectTreeNode): ReactNode => {
      switch (node.kind) {
        case 'component':
          return (
            <ComponentActionsMenu
              component={node.component}
              onAddChild={expand}
              onAddHole={expand}
              onAddStitchLine={expand}
              size="2xs"
              subProject={subProject}
            />
          )
        case 'hole':
          return <HoleActionsMenu hole={node.hole} onAddStitchLine={expand} onDelete={handleHoleDelete} size="2xs" />
        case 'stitch-line':
          return <StitchLineActionsMenu onDelete={handleStitchLineDelete} size="2xs" stitchLine={node.stitchLine} />
      }
    },
    [expand, handleHoleDelete, handleStitchLineDelete, subProject],
  )

  return (
    <ComponentTree
      collection={collection}
      expandedNodeIds={expandedNodeIds}
      hasDragAndDrop={true}
      renderMenu={renderMenu}
      selection={selectedNodeIds}
      onSelectionChange={handleSelectionChange}
      selectionMode="single"
      subProject={subProject}
      onExpandedChange={setExpandedNodeIds}
    />
  )
}
