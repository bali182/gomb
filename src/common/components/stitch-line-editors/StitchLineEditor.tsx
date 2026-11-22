import type { FC } from 'react'
import { useEditableModelsContext } from '../../contexts/EditableModelsContext'
import type { StitchLineSchema } from '../../schemas/stitching'
import { ComponentBoundsStitchLineEditor } from './ComponentBoundsStitchLineEditor'
import { TPocketStitchLineEditor } from './TPocketStitchLineEditor'

export const StitchLineEditor: FC = () => {
  const { selectedModelId, models } = useEditableModelsContext<StitchLineSchema>()
  const stitchLine = models[selectedModelId]

  switch (stitchLine.type) {
    case 'component-bounds-stitch-line':
      return <ComponentBoundsStitchLineEditor />
    case 't-pocket-stitch-line':
      return <TPocketStitchLineEditor />
  }
}
