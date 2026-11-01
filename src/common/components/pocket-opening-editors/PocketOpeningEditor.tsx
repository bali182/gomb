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
import { PocketOpeningEditorPreview } from './PocketOpeningEditorPreview'
import { RecessedPocketOpeningFields } from './RecessedPocketOpeningFields'
import { SlantedPocketOpeningFields } from './SlantedPocketOpeningFields'
import { StraightPocketOpeningFields } from './StraightPocketOpeningFields'

type PocketOpeningFieldsProps = {
  editable: EditableSchema<PocketOpeningSchema>
  issues: IssuesSchema<PocketOpeningSchema>
  onChange: (updated: EditableSchema<PocketOpeningSchema>) => void
}

type PocketOpeningEditorProps = PocketOpeningFieldsProps & {
  opening: PocketOpeningSchema
}

export const PocketOpeningEditor: FC<PocketOpeningEditorProps> = ({ opening, editable, issues, onChange }) => (
  <SectionGroup.Root>
    <PocketOpeningEditorPreview opening={opening} />
    <SectionGroup.Section>
      <PocketOpeningFields editable={editable} issues={issues} onChange={onChange} />
    </SectionGroup.Section>
  </SectionGroup.Root>
)

export const PocketOpeningFields: FC<PocketOpeningFieldsProps> = ({ editable, issues, onChange }) => {
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
