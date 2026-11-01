import { type FC } from 'react'

import { useEditableHole } from '../../hooks/useEditableHole'
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
  hole: HoleSchema
  onAdd: (target: HasTargetSchema) => void
  onClose: () => void
}

export const HoleFloatingEditor: FC<HoleFloatingEditorProps> = ({ anchorElement, hole, onAdd, onClose }) => {
  const { editableHole, hole: editedHole, setHole, validationIssues } = useEditableHole(hole.id)
  const Icon = getModelIconByType(editedHole.type)

  return (
    <FloatingEditor anchorElement={anchorElement} onClose={onClose}>
      <IdentityFloatingEditorHeader<HoleSchema>
        editable={editableHole}
        icon={<Icon />}
        issues={validationIssues}
        menu={<HoleActionsMenu hole={editedHole} onAddStitchLine={onAdd} size="xs" />}
        onChange={setHole}
      />
      <HoleEditor editable={editableHole} hole={editedHole} issues={validationIssues} onChange={setHole} />
    </FloatingEditor>
  )
}
