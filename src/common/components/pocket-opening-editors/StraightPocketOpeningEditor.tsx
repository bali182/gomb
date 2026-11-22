import { EmptyState } from '@chakra-ui/react'
import { type FC } from 'react'
import { useEditableModelsContext } from '../../contexts/EditableModelsContext'
import { usePocketOpeningEditorReference } from '../../hooks/usePocketOpeningEditorReference'

import { useTranslation } from '../../hooks/useTranslation'
import type { StraightPocketOpeningSchema } from '../../schemas/pocketOpening'
import { isDefined } from '../../utils/isDefined'
import { SectionGroup } from '../common/SectionGroup'
import { PocketOpeningEditorPreview } from './PocketOpeningEditorPreview'

export const StraightPocketOpeningEditor: FC = () => {
  const { t } = useTranslation()
  const { selectedModelId, models } = useEditableModelsContext<StraightPocketOpeningSchema>()
  const opening = models[selectedModelId]
  const { pocket: referencePocket } = usePocketOpeningEditorReference(selectedModelId)

  return (
    <SectionGroup.Root>
      {!isDefined(referencePocket) && <PocketOpeningEditorPreview opening={opening} />}
      <SectionGroup.Section>
        <SectionGroup.SectionFullWidthContent>
          <EmptyState.Root alignItems="center" display="flex" height="100%" justifyContent="center">
            <EmptyState.Content>
              <EmptyState.Description textAlign="center">
                {t.project.editors.sections.components.straightPocketOpening.straightDescription}
              </EmptyState.Description>
            </EmptyState.Content>
          </EmptyState.Root>
        </SectionGroup.SectionFullWidthContent>
      </SectionGroup.Section>
    </SectionGroup.Root>
  )
}
