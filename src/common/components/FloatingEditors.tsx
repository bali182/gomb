import { type FC } from 'react'
import { useDrawAreaContext } from '../contexts/DrawAreaContext'
import { useSubProject } from '../hooks/useSubProject'
import { getComponentAnchor, getHoleAnchor, getStitchLineAnchor } from '../utils/floatingEditorAnchorUtils'
import { isDefined } from '../utils/isDefined'
import { narrowers } from '../utils/narrowers'
import { ComponentFloatingEditor } from './component-editors/ComponentFloatingEditor'
import { HoleFloatingEditor } from './hole-editors/HoleFloatingEditor'
import { StitchLineFloatingEditor } from './stitch-line-editors/StitchLineFloatingEditor'

export const FloatingEditors: FC = () => {
  const { selection } = useDrawAreaContext()
  const { subProject } = useSubProject()

  if (!isDefined(selection.selected)) {
    return null
  }

  if (narrowers.is.component(selection.selected)) {
    const anchorElement = getComponentAnchor(selection.selected, subProject)

    return isDefined(anchorElement) ? (
      <ComponentFloatingEditor
        component={selection.selected}
        anchorElement={anchorElement}
        onClose={selection.clearSelection}
      />
    ) : null
  }

  if (narrowers.is.stitchLine(selection.selected)) {
    const anchorElement = getStitchLineAnchor(selection.selected, subProject)

    return isDefined(anchorElement) ? (
      <StitchLineFloatingEditor
        stitchLine={selection.selected}
        anchorElement={anchorElement}
        onClose={selection.clearSelection}
      />
    ) : null
  }

  if (narrowers.is.hole(selection.selected)) {
    const anchorElement = getHoleAnchor(selection.selected, subProject)

    return isDefined(anchorElement) ? (
      <HoleFloatingEditor hole={selection.selected} anchorElement={anchorElement} onClose={selection.clearSelection} />
    ) : null
  }

  return null
}
