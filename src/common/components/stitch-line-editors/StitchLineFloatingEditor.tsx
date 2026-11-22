import { type FC } from 'react'

import { useEditableModelsContext } from '../../contexts/EditableModelsContext'
import type { StitchLineSchema } from '../../schemas/stitching'
import type { FloatingEditorAnchor } from '../../utils/floatingEditorAnchorUtils'
import { getModelIconByType } from '../../utils/getModelIcon'
import { StitchLineActionsMenu } from '../action-menus/StitchLineActionsMenu'
import { FloatingEditor } from '../common/FloatingEditor'
import { IdentityFloatingEditorHeader } from '../common/IdentityFloatingEditorHeader'
import { StitchLineEditor } from './StitchLineEditor'

type StitchLineFloatingEditorProps = {
  anchorElement: FloatingEditorAnchor
  onClose: () => void
}

export const StitchLineFloatingEditor: FC<StitchLineFloatingEditorProps> = ({ anchorElement, onClose }) => {
  const { selectedModelId, models, editableModels, validationIssues, setModel } =
    useEditableModelsContext<StitchLineSchema>()

  const editedStitchLine = models[selectedModelId]
  const editableStitchLine = editableModels[selectedModelId]
  const issues = validationIssues[selectedModelId]
  const setStitchLine = setModel[selectedModelId]
  const Icon = getModelIconByType(editedStitchLine.type)

  return (
    <FloatingEditor anchorElement={anchorElement} onClose={onClose}>
      <IdentityFloatingEditorHeader<StitchLineSchema>
        editable={editableStitchLine}
        icon={<Icon />}
        issues={issues}
        menu={<StitchLineActionsMenu size="xs" stitchLine={editedStitchLine} />}
        onChange={setStitchLine}
      />
      <StitchLineEditor />
    </FloatingEditor>
  )
}
