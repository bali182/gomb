import { useCallback, type FC, type ReactNode } from 'react'
import { useDrawAreaContext } from '../../contexts/DrawAreaContext'
import { useSubProject } from '../../hooks/useSubProject'
import { isDefined } from '../../utils/isDefined'
import { narrowers } from '../../utils/narrowers'
import { BindingActionsMenu } from '../action-menus/BindingActionsMenu'
import { BindingTree } from './BindingTree'
import type { BindingTreeItemNode } from './types/nodeTypes'
import { useBindingTreeCollection } from './utils/useBindingTreeCollection'

export const EditorBindingTree: FC = () => {
  const { subProject } = useSubProject()
  const { selection } = useDrawAreaContext()
  const collection = useBindingTreeCollection(subProject.bindings)

  const handleDelete = useCallback(
    (bindingId: string): void => {
      if (
        isDefined(selection.selected) &&
        narrowers.is.binding(selection.selected) &&
        selection.selected.id === bindingId
      ) {
        selection.clearSelection()
      }
    },
    [selection],
  )

  const renderMenu = useCallback(
    (node: BindingTreeItemNode): ReactNode => (
      <BindingActionsMenu binding={node.binding} size="2xs" onDelete={handleDelete} />
    ),
    [handleDelete],
  )
  return <BindingTree collection={collection} selection={selection} renderMenu={renderMenu} />
}
