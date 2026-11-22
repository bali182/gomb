import type { FC } from 'react'
import { useEditableModelsContext } from '../../contexts/EditableModelsContext'
import type { PocketOpeningSchema } from '../../schemas/pocketOpening'
import { OpticalIllusionPocketOpeningEditor } from './OpticalIllusionPocketOpeningEditor'
import { RecessedPocketOpeningEditor } from './RecessedPocketOpeningEditor'
import { SlantedPocketOpeningEditor } from './SlantedPocketOpeningEditor'
import { StraightPocketOpeningEditor } from './StraightPocketOpeningEditor'

export const PocketOpeningEditor: FC = () => {
  const { selectedModelId, models } = useEditableModelsContext<PocketOpeningSchema>()
  const opening = models[selectedModelId]

  switch (opening.type) {
    case 'straight':
      return <StraightPocketOpeningEditor />
    case 'recessed':
      return <RecessedPocketOpeningEditor />
    case 'slanted':
      return <SlantedPocketOpeningEditor />
    case 'optical-illusion':
      return <OpticalIllusionPocketOpeningEditor />
  }
}
