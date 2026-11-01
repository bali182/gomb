import type { FC } from 'react'
import type { EditableSchema } from '../../schemas/editable'
import type { IssuesSchema } from '../../schemas/issues'
import type {
  OpticalIllusionPocketOpeningSchema,
  PocketOpeningSchema,
  RecessedPocketOpeningSchema,
  SlantedPocketOpeningSchema,
  StraightPocketOpeningSchema,
} from '../../schemas/pocketOpening'
import { SectionGroup } from '../common/SectionGroup'
import { OpticalIllusionPocketOpeningFields } from './OpticalIllusionPocketOpeningFields'
import { RecessedPocketOpeningFields } from './RecessedPocketOpeningFields'
import { SlantedPocketOpeningFields } from './SlantedPocketOpeningFields'
import { StraightPocketOpeningFields } from './StraightPocketOpeningFields'

type PocketOpeningEditorProps = {
  editable: EditableSchema<PocketOpeningSchema>
  issues: IssuesSchema<PocketOpeningSchema>
  onChange: (updated: EditableSchema<PocketOpeningSchema>) => void
}

export const PocketOpeningFields: FC<PocketOpeningEditorProps> = ({ editable, issues, onChange }) => {
  switch (editable.type) {
    case 'straight':
      return (
        <StraightPocketOpeningFields
          editable={editable}
          issues={issues as IssuesSchema<StraightPocketOpeningSchema>}
          onChange={onChange}
        />
      )
    case 'recessed':
      return (
        <RecessedPocketOpeningFields
          modelId={editable.id}
          editable={editable}
          issues={issues as IssuesSchema<RecessedPocketOpeningSchema>}
          onChange={onChange}
        />
      )
    case 'slanted':
      return (
        <SlantedPocketOpeningFields
          modelId={editable.id}
          editable={editable}
          issues={issues as IssuesSchema<SlantedPocketOpeningSchema>}
          onChange={onChange}
        />
      )
    case 'optical-illusion':
      return (
        <OpticalIllusionPocketOpeningFields
          modelId={editable.id}
          editable={editable}
          issues={issues as IssuesSchema<OpticalIllusionPocketOpeningSchema>}
          onChange={onChange}
        />
      )
  }
}

export const PocketOpeningEditor: FC<PocketOpeningEditorProps> = (props) => (
  <SectionGroup.Root>
    <SectionGroup.Section>
      <PocketOpeningFields {...props} />
    </SectionGroup.Section>
  </SectionGroup.Root>
)
