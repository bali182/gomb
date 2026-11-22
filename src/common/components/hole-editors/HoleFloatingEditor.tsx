import { type FC } from 'react'

import { useEditableModelsContext } from '../../contexts/EditableModelsContext'
import type { HasTargetSchema } from '../../schemas/common'
import type { HoleSchema } from '../../schemas/hole'
import type { FloatingEditorAnchor } from '../../utils/floatingEditorAnchorUtils'
import { getModelIconByType } from '../../utils/getModelIcon'
import { HoleActionsMenu } from '../action-menus/HoleActionsMenu'
import { FloatingEditor } from '../common/FloatingEditor'
import { IdentityFloatingEditorHeader } from '../common/IdentityFloatingEditorHeader'
import { HoleEditor } from './HoleEditor'

type HoleFloatingEditorProps = {
  anchorElement: FloatingEditorAnchor
  onAdd: (target: HasTargetSchema) => void
  onClose: () => void
}

export const HoleFloatingEditor: FC<HoleFloatingEditorProps> = ({ anchorElement, onAdd, onClose }) => {
  const { selectedModelId, models, editableModels, validationIssues, setModel } = useEditableModelsContext<HoleSchema>()

  const editedHole = models[selectedModelId]
  const editableHole = editableModels[selectedModelId]
  const issues = validationIssues[selectedModelId]
  const setHole = setModel[selectedModelId]

  const Icon = getModelIconByType(editedHole.type)

  return (
    <FloatingEditor anchorElement={anchorElement} onClose={onClose}>
      <IdentityFloatingEditorHeader<HoleSchema>
        editable={editableHole}
        icon={<Icon />}
        issues={issues}
        menu={<HoleActionsMenu hole={editedHole} onAddStitchLine={onAdd} size="xs" />}
        onChange={setHole}
      />
      <HoleEditor />
    </FloatingEditor>
  )
}
