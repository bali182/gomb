import { useCallback, useEffect, useImperativeHandle, useState, type FC, type ReactNode, type Ref } from 'react'

import { useDrawAreaContext } from '../../contexts/DrawAreaContext'
import { useSubProject } from '../../hooks/useSubProject'
import { useSubProjectOperations } from '../../hooks/useSubProjectOperations'
import { isDefined } from '../../utils/isDefined'
import { ComponentActionsMenu } from '../ComponentActionsMenu'
import { StitchLineActionsMenu } from '../StitchLineActionsMenu'
import { ComponentTree } from './ComponentTree'
import { HoleActionsMenu } from './HoleActionsMenu'
import type { ProjectTreeNode } from './types/nodeTypes'
import { getNextExpandedNodeIds } from './utils/getNextExpandedNodeIds'
import { getComponentNodeId } from './utils/treeNodeIds'
import { useComponentTreeCollection } from './utils/useComponentTreeCollection'

export type EditorComponentTreeHandle = {
  collapseAll: () => void
  expandAll: () => void
}

type EditorComponentTreeProps = {
  ref?: Ref<EditorComponentTreeHandle>
}

export const EditorComponentTree: FC<EditorComponentTreeProps> = ({ ref }) => {
  const { selection } = useDrawAreaContext()
  const { subProject } = useSubProject()
  const operations = useSubProjectOperations()
  const [expandedNodeIds, setExpandedNodeIds] = useState<string[]>(() => [getComponentNodeId(subProject.root)])

  const collection = useComponentTreeCollection(subProject, {
    showHoles: true,
    showStitchLines: true,
  })

  const { selected } = selection

  const collapseAll = useCallback((): void => {
    setExpandedNodeIds([])
  }, [])

  const expandAll = useCallback((): void => {
    setExpandedNodeIds(collection.getBranchValues())
  }, [collection])

  useImperativeHandle(ref, () => ({ collapseAll, expandAll }), [collapseAll, expandAll])

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

  const handleAddChild = useCallback((parentId: string): void => {
    setExpandedNodeIds((currentExpandedNodeIds) =>
      Array.from(new Set([...currentExpandedNodeIds, getComponentNodeId(parentId)])),
    )
  }, [])

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
              onAddChild={handleAddChild}
              size="2xs"
              subProject={subProject}
            />
          )
        case 'hole':
          return <HoleActionsMenu hole={node.hole} onDelete={handleHoleDelete} size="2xs" />
        case 'stitch-line':
          return <StitchLineActionsMenu onDelete={handleStitchLineDelete} size="2xs" stitchLine={node.stitchLine} />
      }
    },
    [handleAddChild, handleHoleDelete, handleStitchLineDelete, subProject],
  )

  return (
    <ComponentTree
      collection={collection}
      expandedNodeIds={expandedNodeIds}
      hasDragAndDrop={true}
      operations={operations}
      renderMenu={renderMenu}
      selection={selection}
      setExpandedNodeIds={setExpandedNodeIds}
    />
  )
}
