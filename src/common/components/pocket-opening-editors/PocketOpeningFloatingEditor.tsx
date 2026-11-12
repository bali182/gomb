import type { FC } from 'react'
import { useEditablePocketOpening } from '../../hooks/useEditablePocketOpening'
import { usePocketOpeningEditorReference } from '../../hooks/usePocketOpeningEditorReference'
import { useSubProject } from '../../hooks/useSubProject'
import type { PocketOpeningSchema } from '../../schemas/pocketOpening'
import { floatingEditorAnchors } from '../../utils/floatingEditorAnchorUtils'
import { isDefined } from '../../utils/isDefined'
import { PocketOpeningActionsMenu } from '../action-menus/PocketOpeningActionsMenu'
import { FloatingEditor } from '../common/FloatingEditor'
import { IdentityFloatingEditorHeader } from '../common/IdentityFloatingEditorHeader'
import { PocketOpeningEditor } from './PocketOpeningEditor'
import { PocketOpeningIcon } from './PocketOpeningIcon'
import { PocketOpeningTargetCombobox } from './PocketOpeningTargetCombobox'

type PocketOpeningFloatingEditorProps = {
  opening: PocketOpeningSchema
  onClose: () => void
}

export const PocketOpeningFloatingEditor: FC<PocketOpeningFloatingEditorProps> = ({ opening, onClose }) => {
  const { subProject } = useSubProject()
  const { opening: editedOpening, editableOpening, validationIssues, setOpening } = useEditablePocketOpening(opening.id)
  const { pocket: referencePocket, pockets, setPocketReference } = usePocketOpeningEditorReference(opening.id)

  const pocketAnchor = isDefined(referencePocket)
    ? floatingEditorAnchors.component(referencePocket, subProject)
    : undefined

  const anchorElement = pocketAnchor ?? floatingEditorAnchors.pocketOpening(editedOpening)

  if (!isDefined(anchorElement)) {
    return null
  }

  return (
    <FloatingEditor
      anchorElement={anchorElement}
      onClose={onClose}
      positioning={isDefined(pocketAnchor) ? 'to-svg' : 'to-tree'}
    >
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
        rightAddon={
          <PocketOpeningTargetCombobox pockets={pockets} pocket={referencePocket} onChange={setPocketReference} />
        }
      />
      <PocketOpeningEditor
        opening={editedOpening}
        referencePocket={referencePocket}
        editable={editableOpening}
        issues={validationIssues}
        onChange={setOpening}
      />
    </FloatingEditor>
  )
}
