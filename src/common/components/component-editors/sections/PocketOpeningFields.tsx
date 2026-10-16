import { Grid } from '@chakra-ui/react'
import type { FC } from 'react'

import type { PocketOpeningSchema, RecessedPocketOpeningSchema } from '../../../schemas/components'
import type { EditableSchema } from '../../../schemas/editable'
import type { ValidationIssuesSchema } from '../../../schemas/validation'
import { RecessedPocketOpeningFields } from './RecessedPocketOpeningFields'

type PocketOpeningFieldsProps = {
  editable: EditableSchema<PocketOpeningSchema>
  issues: ValidationIssuesSchema<PocketOpeningSchema>
  onChange: (updated: EditableSchema<PocketOpeningSchema>) => void
}

export const PocketOpeningFields: FC<PocketOpeningFieldsProps> = ({ editable, issues, onChange }) => {
  return (
    <Grid templateColumns="max-content minmax(0, 1fr)" columnGap="4" rowGap="3" pb="3">
      <PocketOpeningShapeFields editable={editable} issues={issues} onChange={onChange} />
    </Grid>
  )
}

const PocketOpeningShapeFields: FC<PocketOpeningFieldsProps> = ({ editable, issues, onChange }) => {
  switch (editable.type) {
    case 'straight':
      return undefined
    case 'recessed':
      return (
        <RecessedPocketOpeningFields
          editable={editable}
          issues={issues as ValidationIssuesSchema<RecessedPocketOpeningSchema>}
          onChange={(updated: EditableSchema<RecessedPocketOpeningSchema>): void =>
            onChange({ ...updated, id: editable.id, name: editable.name })
          }
        />
      )
  }
}
