import { Grid } from '@chakra-ui/react'
import type { FC } from 'react'

import type {
  PocketOpeningSchema,
  PocketOrientationSchema,
  RecessedPocketOpeningSchema,
  SlantedPocketOpeningSchema,
} from '../../../schemas/components'
import type { EditableSchema } from '../../../schemas/editable'
import type { IssuesSchema } from '../../../schemas/issues'
import { RecessedPocketOpeningFields } from './RecessedPocketOpeningFields'
import { SlantedPocketOpeningFields } from './SlantedPocketOpeningFields'

type PocketOpeningFieldsProps = {
  editable: EditableSchema<PocketOpeningSchema>
  issues: IssuesSchema<PocketOpeningSchema>
  orientation: PocketOrientationSchema
  onChange: (updated: EditableSchema<PocketOpeningSchema>) => void
}

export const PocketOpeningFields: FC<PocketOpeningFieldsProps> = ({ editable, issues, orientation, onChange }) => {
  return (
    <Grid templateColumns="max-content minmax(0, 1fr)" columnGap="4" rowGap="3" pb="3">
      <PocketOpeningShapeFields editable={editable} issues={issues} orientation={orientation} onChange={onChange} />
    </Grid>
  )
}

const PocketOpeningShapeFields: FC<PocketOpeningFieldsProps> = ({ editable, issues, orientation, onChange }) => {
  switch (editable.type) {
    case 'slanted':
      return (
        <SlantedPocketOpeningFields
          editable={editable}
          issues={issues as IssuesSchema<SlantedPocketOpeningSchema>}
          orientation={orientation}
          onChange={onChange}
        />
      )
    case 'straight':
      return undefined
    case 'recessed':
      return (
        <RecessedPocketOpeningFields
          editable={editable}
          issues={issues as IssuesSchema<RecessedPocketOpeningSchema>}
          onChange={onChange}
        />
      )
  }
}
