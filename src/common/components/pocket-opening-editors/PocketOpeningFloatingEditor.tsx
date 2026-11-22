import type { FC } from 'react'
import { useEditableModelsContext } from '../../contexts/EditableModelsContext'
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
  onClose: () => void
}

export const PocketOpeningFloatingEditor: FC<PocketOpeningFloatingEditorProps> = ({ onClose }) => {
  const { subProject } = useSubProject()
  const { selectedModelId, models, editableModels, validationIssues, setModel } =
    useEditableModelsContext<PocketOpeningSchema>()

  const editedOpening = models[selectedModelId]
  const editableOpening = editableModels[selectedModelId]
  const issues = validationIssues[selectedModelId]
  const setOpening = setModel[selectedModelId]

  const { pocket: referencePocket, pockets, setPocketReference } = usePocketOpeningEditorReference(selectedModelId)

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
        issues={issues}
        menu={<PocketOpeningActionsMenu opening={editedOpening} size="xs" onDelete={onClose} />}
        onChange={setOpening}
        rightAddon={
          <PocketOpeningTargetCombobox pockets={pockets} pocket={referencePocket} onChange={setPocketReference} />
        }
      />
      <PocketOpeningEditor />
    </FloatingEditor>
  )
}
