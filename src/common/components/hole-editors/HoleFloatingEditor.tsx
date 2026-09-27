import { type FC } from 'react'

import { useEditableHole } from '../../hooks/useEditableHole'
import type { HasTargetSchema } from '../../schemas/common'
import type { HoleSchema } from '../../schemas/hole'
import type { FloatingEditorAnchor } from '../../utils/floatingEditorAnchorUtils'
import { getModelIcon } from '../../utils/getModelIcon'
import { FloatingEditor } from '../common/FloatingEditor'
import { IdentityFloatingEditorHeader } from '../common/IdentityFloatingEditorHeader'
import { HoleActionsMenu } from '../component-tree/HoleActionsMenu'
import { HoleEditor } from './HoleEditor'

type HoleFloatingEditorProps = {
  anchorElement: FloatingEditorAnchor
  hole: HoleSchema
  onAdd: (target: HasTargetSchema) => void
  onClose: () => void
}

export const HoleFloatingEditor: FC<HoleFloatingEditorProps> = ({ anchorElement, hole, onAdd, onClose }) => {
  const { editableHole, hole: editedHole, setHole, validationIssues } = useEditableHole(hole.id)

  return (
    <FloatingEditor anchorElement={anchorElement} onClose={onClose}>
      <IdentityFloatingEditorHeader<HoleSchema>
        editable={editableHole}
        icon={getModelIcon(editedHole.type)}
        issues={validationIssues}
        menu={<HoleActionsMenu hole={editedHole} onAddStitchLine={onAdd} size="xs" />}
        onChange={setHole}
      />
      <HoleEditor editable={editableHole} hole={editedHole} issues={validationIssues} onChange={setHole} />
    </FloatingEditor>
  )
}
