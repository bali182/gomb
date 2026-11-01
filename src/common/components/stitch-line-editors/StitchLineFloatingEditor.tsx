import { useCallback, type FC } from 'react'
import { narrowers } from '../../utils/narrowers'

import { useEditableStitchLine } from '../../hooks/useEditableStitchLine'
import type { StitchLineSchema } from '../../schemas/stitching'
import type { FloatingEditorAnchor } from '../../utils/floatingEditorAnchorUtils'
import { getModelIconByType } from '../../utils/getModelIcon'
import { StitchLineActionsMenu } from '../action-menus/StitchLineActionsMenu'
import { FloatingEditor } from '../common/FloatingEditor'
import { IdentityFloatingEditorHeader } from '../common/IdentityFloatingEditorHeader'
import { StitchLineEditor } from './StitchLineEditor'
import { StitchLineRenderTargetCombobox } from './StitchLineRenderTargetCombobox'

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

  const handleRenderTargetChange = useCallback(
    (onTop: string): void => {
      if (editableStitchLine.type === 'component-bounds-stitch-line') {
        setStitchLine({ ...editableStitchLine, onTop })
      }
    },
    [editableStitchLine, setStitchLine],
  )

  const handleRenderTargetReset = useCallback((): void => {
    if (editableStitchLine.type === 'component-bounds-stitch-line') {
      setStitchLine({ ...editableStitchLine, onTop: undefined })
    }
  }, [editableStitchLine, setStitchLine])

  return (
    <FloatingEditor anchorElement={anchorElement} onClose={onClose}>
      <IdentityFloatingEditorHeader<StitchLineSchema>
        editable={editableStitchLine}
        icon={<Icon />}
        issues={validationIssues}
        menu={<StitchLineActionsMenu size="xs" stitchLine={editedStitchLine} />}
        onChange={setStitchLine}
        rightAddon={
          narrowers.is.componentBoundsStitchLine(editedStitchLine) && (
            <StitchLineRenderTargetCombobox
              onChange={handleRenderTargetChange}
              onReset={handleRenderTargetReset}
              stitchLine={editedStitchLine}
            />
          )
        }
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
