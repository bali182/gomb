import { type FC } from 'react'
import { useDrawAreaContext } from '../contexts/DrawAreaContext'
import { useSubProject } from '../hooks/useSubProject'
import type { HasTargetSchema } from '../schemas/common'
import { floatingEditorAnchors } from '../utils/floatingEditorAnchorUtils'
import { isDefined } from '../utils/isDefined'
import { narrowers } from '../utils/narrowers'
import { ComponentFloatingEditor } from './component-editors/ComponentFloatingEditor'
import { HoleFloatingEditor } from './hole-editors/HoleFloatingEditor'
import { PocketOpeningFloatingEditor } from './pocket-opening-editors/PocketOpeningFloatingEditor'
import { StitchLineFloatingEditor } from './stitch-line-editors/StitchLineFloatingEditor'

type FloatingEditorsProps = {
  onAdd: (target: HasTargetSchema) => void
}

export const FloatingEditors: FC<FloatingEditorsProps> = ({ onAdd }) => {
  const { selection } = useDrawAreaContext()
  const { subProject } = useSubProject()

  if (!isDefined(selection.selected)) {
    return null
  }

  if (narrowers.is.component(selection.selected)) {
    const anchorElement = floatingEditorAnchors.component(selection.selected, subProject)

    return isDefined(anchorElement) ? (
      <ComponentFloatingEditor
        component={selection.selected}
        anchorElement={anchorElement}
        onAdd={onAdd}
        onClose={selection.clearSelection}
      />
    ) : null
  }

  if (narrowers.is.stitchLine(selection.selected)) {
    const anchorElement = floatingEditorAnchors.stitchLine(selection.selected, subProject)

    return isDefined(anchorElement) ? (
      <StitchLineFloatingEditor
        stitchLine={selection.selected}
        anchorElement={anchorElement}
        onClose={selection.clearSelection}
      />
    ) : null
  }

  if (narrowers.is.hole(selection.selected)) {
    const anchorElement = floatingEditorAnchors.hole(selection.selected, subProject)

    return isDefined(anchorElement) ? (
      <HoleFloatingEditor
        hole={selection.selected}
        anchorElement={anchorElement}
        onAdd={onAdd}
        onClose={selection.clearSelection}
      />
    ) : null
  }

  if (narrowers.is.pocketOpening(selection.selected)) {
    const anchorElement = floatingEditorAnchors.pocketOpening(selection.selected)

    return isDefined(anchorElement) ? (
      <PocketOpeningFloatingEditor
        opening={selection.selected}
        anchorElement={anchorElement}
        onClose={selection.clearSelection}
      />
    ) : null
  }

  return null
}
