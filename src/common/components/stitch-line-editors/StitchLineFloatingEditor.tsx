import { useCallback, type FC } from 'react'

import { useEditableStitchLine } from '../../hooks/useEditableStitchLine'
import type { StitchLineSchema } from '../../schemas/stitching'
import type { FloatingEditorAnchor } from '../../utils/floatingEditorAnchorUtils'
import { getModelIcon } from '../../utils/getModelIcon'
import { FloatingEditor } from '../common/FloatingEditor'
import { IdentityFloatingEditorHeader } from '../common/IdentityFloatingEditorHeader'
import { StitchLineActionsMenu } from '../StitchLineActionsMenu'
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
        icon={getModelIcon(editedStitchLine.type)}
        issues={validationIssues}
        menu={<StitchLineActionsMenu size="xs" stitchLine={editedStitchLine} />}
        onChange={setStitchLine}
        rightAddon={
          editedStitchLine.type === 'component-bounds-stitch-line' && (
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
