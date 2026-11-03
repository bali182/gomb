import type { FC } from 'react'
import { useEditablePocketOpening } from '../../hooks/useEditablePocketOpening'
import { useSubProject } from '../../hooks/useSubProject'
import type { PocketOpeningSchema } from '../../schemas/pocketOpening'
import type { FloatingEditorAnchor } from '../../utils/floatingEditorAnchorUtils'
import { PocketOpeningActionsMenu } from '../action-menus/PocketOpeningActionsMenu'
import { FloatingEditor } from '../common/FloatingEditor'
import { IdentityFloatingEditorHeader } from '../common/IdentityFloatingEditorHeader'
import { PocketOpeningEditor } from './PocketOpeningEditor'
import { PocketOpeningIcon } from './PocketOpeningIcon'

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
  const { subProject } = useSubProject()
  const { opening: editedOpening, editableOpening, validationIssues, setOpening } = useEditablePocketOpening(opening.id)
  return (
    <FloatingEditor anchorElement={anchorElement} onClose={onClose}>
      <IdentityFloatingEditorHeader<PocketOpeningSchema>
        editable={editableOpening}
        icon={
          <PocketOpeningIcon
            type={editedOpening.type}
            isDefault={subProject.defaultPocketOpening === editedOpening.id}
          />
        }
        issues={validationIssues}
        menu={<PocketOpeningActionsMenu opening={editedOpening} size="xs" onDelete={onClose} />}
        onChange={setOpening}
      />
      <PocketOpeningEditor
        opening={editedOpening}
        editable={editableOpening}
        issues={validationIssues}
        onChange={setOpening}
      />
    </FloatingEditor>
  )
}
