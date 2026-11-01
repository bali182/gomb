import { useCallback, type FC, type ReactNode } from 'react'
import { useDrawAreaContext } from '../../contexts/DrawAreaContext'
import { useSubProject } from '../../hooks/useSubProject'
import { isDefined } from '../../utils/isDefined'
import { narrowers } from '../../utils/narrowers'
import { PocketOpeningActionsMenu } from '../action-menus/PocketOpeningActionsMenu'
import { PocketOpeningTree } from './PocketOpeningTree'
import type { PocketOpeningTreeItemNode } from './types/nodeTypes'
import { usePocketOpeningTreeCollection } from './utils/usePocketOpeningTreeCollection'

export const EditorPocketOpeningTree: FC = () => {
  const { subProject } = useSubProject()
  const { selection } = useDrawAreaContext()
  const collection = usePocketOpeningTreeCollection(subProject.pocketOpenings)
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

  return <PocketOpeningTree collection={collection} selection={selection} renderMenu={renderMenu} />
}
