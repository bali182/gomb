import { type FC } from 'react'
import { useDrawAreaContext } from '../contexts/DrawAreaContext'
import { useSubProject } from '../hooks/useSubProject'
import type { HasTargetSchema } from '../schemas/common'
import { floatingEditorAnchors } from '../utils/floatingEditorAnchorUtils'
import { isDefined } from '../utils/isDefined'
import { narrowers } from '../utils/narrowers'
import { EditableModelsProvider } from './EditableModelsProvider'
import { BindingFloatingEditor } from './binding-editors/BindingFloatingEditor'
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
      <EditableModelsProvider key={selection.selected.id} model={selection.selected}>
        <ComponentFloatingEditor anchorElement={anchorElement} onAdd={onAdd} onClose={selection.clearSelection} />
      </EditableModelsProvider>
    ) : null
  }

  if (narrowers.is.stitchLine(selection.selected)) {
    const anchorElement = floatingEditorAnchors.stitchLine(selection.selected, subProject)

    return isDefined(anchorElement) ? (
      <EditableModelsProvider key={selection.selected.id} model={selection.selected}>
        <StitchLineFloatingEditor anchorElement={anchorElement} onClose={selection.clearSelection} />
      </EditableModelsProvider>
    ) : null
  }

  if (narrowers.is.hole(selection.selected)) {
    const anchorElement = floatingEditorAnchors.hole(selection.selected, subProject)

    return isDefined(anchorElement) ? (
      <EditableModelsProvider key={selection.selected.id} model={selection.selected}>
        <HoleFloatingEditor anchorElement={anchorElement} onAdd={onAdd} onClose={selection.clearSelection} />
      </EditableModelsProvider>
    ) : null
  }

  if (narrowers.is.pocketOpening(selection.selected)) {
    return (
      <EditableModelsProvider key={selection.selected.id} model={selection.selected}>
        <PocketOpeningFloatingEditor onClose={selection.clearSelection} />
      </EditableModelsProvider>
    )
  }

  if (narrowers.is.binding(selection.selected)) {
    const anchorElement = floatingEditorAnchors.binding(selection.selected)
    return isDefined(anchorElement) ? (
      <BindingFloatingEditor
        binding={selection.selected}
        anchorElement={anchorElement}
        onClose={selection.clearSelection}
      />
    ) : null
  }

  return null
}
