import { EmptyState } from '@chakra-ui/react'
import { type FC } from 'react'

import { useTranslation } from '../../hooks/useTranslation'
import type { PocketSchema } from '../../schemas/components'
import type { StraightPocketOpeningSchema } from '../../schemas/pocketOpening'
import { isDefined } from '../../utils/isDefined'
import { SectionGroup } from '../common/SectionGroup'
import { PocketOpeningEditorPreview } from './PocketOpeningEditorPreview'

type StraightPocketOpeningEditorProps = {
  opening: StraightPocketOpeningSchema
  referencePocket: PocketSchema | undefined
}

export const StraightPocketOpeningEditor: FC<StraightPocketOpeningEditorProps> = ({ opening, referencePocket }) => {
  const { t } = useTranslation()

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
