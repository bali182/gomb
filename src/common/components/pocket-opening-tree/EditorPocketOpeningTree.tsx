import { useCallback, useMemo, type FC, type ReactNode } from 'react'
import { useDrawAreaContext } from '../../contexts/DrawAreaContext'
import { useSubProject } from '../../hooks/useSubProject'
import { isDefined } from '../../utils/isDefined'
import { narrowers } from '../../utils/narrowers'
import { PocketOpeningActionsMenu } from '../action-menus/PocketOpeningActionsMenu'
import { PocketOpeningTree } from './PocketOpeningTree'
import type { PocketOpeningTreeItemNode } from './types/nodeTypes'
import { getPocketOpeningNodeId, usePocketOpeningTreeCollection } from './utils/usePocketOpeningTreeCollection'

export const EditorPocketOpeningTree: FC = () => {
  const { subProject } = useSubProject()
  const { selection } = useDrawAreaContext()
  const collection = usePocketOpeningTreeCollection(subProject.pocketOpenings)
  const selectedNodeIds = useMemo<string[]>(() => {
    if (isDefined(selection.selected) && narrowers.is.pocketOpening(selection.selected)) {
      return [getPocketOpeningNodeId(selection.selected.id)]
    }
    return []
  }, [selection.selected])

  const handleSelectionChange = useCallback(
    (nodeIds: string[]): void => {
      const nodeId = nodeIds[0]
      const node = isDefined(nodeId) ? collection.findNode(nodeId) : undefined
      if (isDefined(node) && node.kind === 'pocket-opening') {
        selection.select(node.opening)
      }
    },
    [collection, selection],
  )

  const handleDelete = useCallback(
    (openingId: string): void => {
      if (
        isDefined(selection.selected) &&
        narrowers.is.pocketOpening(selection.selected) &&
        selection.selected.id === openingId
      ) {
        selection.clearSelection()
      }
    },
    [selection],
  )
  const renderMenu = useCallback(
    (node: PocketOpeningTreeItemNode): ReactNode => (
      <PocketOpeningActionsMenu opening={node.opening} size="2xs" onDelete={handleDelete} />
    ),
    [handleDelete],
  )

  return (
    <PocketOpeningTree
      collection={collection}
      selection={selectedNodeIds}
      onSelectionChange={handleSelectionChange}
      selectionMode="single"
      defaultPocketOpeningId={subProject.defaultPocketOpening}
      hasDragAndDrop={true}
      renderMenu={renderMenu}
    />
  )
}
