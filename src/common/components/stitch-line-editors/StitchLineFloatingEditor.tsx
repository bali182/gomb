import { type FC } from 'react'

import { useEditableStitchLine } from '../../hooks/useEditableStitchLine'
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
  stitchLine: StitchLineSchema
}

export const StitchLineFloatingEditor: FC<StitchLineFloatingEditorProps> = ({ anchorElement, onClose, stitchLine }) => {
  const {
    editableStitchLine,
    resolvedEditableStitchLine,
    setStitchLine,
    stitchLine: editedStitchLine,
    validationIssues,
  } = useEditableStitchLine(stitchLine.id)
  const Icon = getModelIconByType(editedStitchLine.type)

  return (
    <FloatingEditor anchorElement={anchorElement} onClose={onClose}>
      <IdentityFloatingEditorHeader<StitchLineSchema>
        editable={editableStitchLine}
        icon={<Icon />}
        issues={validationIssues}
        menu={<StitchLineActionsMenu size="xs" stitchLine={editedStitchLine} />}
        onChange={setStitchLine}
      />
      <StitchLineEditor
        editable={editableStitchLine}
        issues={validationIssues}
        onChange={setStitchLine}
        resolvedEditable={resolvedEditableStitchLine}
        stitchLine={editedStitchLine}
      />
    </FloatingEditor>
  )
}
