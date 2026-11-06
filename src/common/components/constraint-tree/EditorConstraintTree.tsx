import { useCallback, type FC, type ReactNode } from 'react'
import { useDrawAreaContext } from '../../contexts/DrawAreaContext'
import { useSubProject } from '../../hooks/useSubProject'
import { isDefined } from '../../utils/isDefined'
import { narrowers } from '../../utils/narrowers'
import { ConstraintActionsMenu } from '../action-menus/ConstraintActionsMenu'
import { ConstraintTree } from './ConstraintTree'
import type { ConstraintTreeItemNode } from './types/nodeTypes'
import { useConstraintTreeCollection } from './utils/useConstraintTreeCollection'

export const EditorConstraintTree: FC = () => {
  const { subProject } = useSubProject()
  const { selection } = useDrawAreaContext()
  const collection = useConstraintTreeCollection(subProject.constraints)

  const handleDelete = useCallback(
    (constraintId: string): void => {
      if (
        isDefined(selection.selected) &&
        narrowers.is.constraint(selection.selected) &&
        selection.selected.id === constraintId
      ) {
        selection.clearSelection()
      }
    },
    [selection],
  )

  const renderMenu = useCallback(
    (node: ConstraintTreeItemNode): ReactNode => (
      <ConstraintActionsMenu constraint={node.constraint} size="2xs" onDelete={handleDelete} />
    ),
    [handleDelete],
  )
  return <ConstraintTree collection={collection} selection={selection} renderMenu={renderMenu} />
}
