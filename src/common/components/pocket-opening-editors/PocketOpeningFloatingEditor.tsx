import type { FC } from 'react'
import { useEditablePocketOpening } from '../../hooks/useEditablePocketOpening'
import type { PocketOpeningSchema } from '../../schemas/pocketOpening'
import type { FloatingEditorAnchor } from '../../utils/floatingEditorAnchorUtils'
import { getModelIconByType } from '../../utils/getModelIcon'
import { PocketOpeningActionsMenu } from '../action-menus/PocketOpeningActionsMenu'
import { FloatingEditor } from '../common/FloatingEditor'
import { IdentityFloatingEditorHeader } from '../common/IdentityFloatingEditorHeader'
import { PocketOpeningEditor } from './PocketOpeningEditor'

type PocketOpeningFloatingEditorProps = {
  opening: PocketOpeningSchema
  anchorElement: FloatingEditorAnchor
  onClose: () => void
}

export const PocketOpeningFloatingEditor: FC<PocketOpeningFloatingEditorProps> = ({
  opening,
  anchorElement,
  onClose,
}) => {
  const { opening: editedOpening, editableOpening, validationIssues, setOpening } = useEditablePocketOpening(opening.id)
  return (
    <FloatingEditor anchorElement={anchorElement} onClose={onClose}>
      <IdentityFloatingEditorHeader<PocketOpeningSchema>
        editable={editableOpening}
        icon={getModelIconByType(editedOpening.type)}
        issues={validationIssues}
        menu={<PocketOpeningActionsMenu opening={editedOpening} size="xs" onDelete={onClose} />}
        onChange={setOpening}
      />
      <PocketOpeningEditor editable={editableOpening} issues={validationIssues} onChange={setOpening} />
    </FloatingEditor>
  )
}
