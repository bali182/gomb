import { EmptyState } from '@chakra-ui/react'
import { type FC } from 'react'

import { useTranslation } from '../../../hooks/useTranslation'
import type { StraightPocketOpeningSchema } from '../../../schemas/components'
import type { EditableSchema } from '../../../schemas/editable'
import type { IssuesSchema } from '../../../schemas/issues'
import { SectionGroup } from '../../common/SectionGroup'

type StraightPocketOpeningFieldsProps = {
  editable: EditableSchema<StraightPocketOpeningSchema>
  issues: IssuesSchema<StraightPocketOpeningSchema>
  onChange: (updated: EditableSchema<StraightPocketOpeningSchema>) => void
}

export const StraightPocketOpeningFields: FC<StraightPocketOpeningFieldsProps> = () => {
  const { t } = useTranslation()

  return (
    <SectionGroup.SectionFullWidthContent>
      <EmptyState.Root alignItems="center" display="flex" height="100%" justifyContent="center">
        <EmptyState.Content>
          <EmptyState.Description textAlign="center">
            {t.project.editors.sections.components.straightPocketOpening.straightDescription}
          </EmptyState.Description>
        </EmptyState.Content>
      </EmptyState.Root>
    </SectionGroup.SectionFullWidthContent>
  )
}
