import type { FC } from 'react'
import { useCombinedIssues } from '../../hooks/useCombinedIssues'
import { usePocketOpeningLimitIssues } from '../../hooks/usePocketOpeningLimitIssues'
import type { PocketSchema } from '../../schemas/components'
import type { EditableSchema } from '../../schemas/editable'
import type { IssuesSchema } from '../../schemas/issues'
import type {
  OpticalIllusionPocketOpeningSchema,
  PocketOpeningSchema,
  RecessedPocketOpeningSchema,
  SlantedPocketOpeningSchema,
  StraightPocketOpeningSchema,
} from '../../schemas/pocketOpening'
import { OpticalIllusionPocketOpeningEditor } from './OpticalIllusionPocketOpeningEditor'
import { RecessedPocketOpeningEditor } from './RecessedPocketOpeningEditor'
import { SlantedPocketOpeningEditor } from './SlantedPocketOpeningEditor'
import { StraightPocketOpeningEditor } from './StraightPocketOpeningEditor'

type PocketOpeningEditorProps = {
  editable: EditableSchema<PocketOpeningSchema>
  issues: IssuesSchema<PocketOpeningSchema>
  onChange: (updated: EditableSchema<PocketOpeningSchema>) => void
  opening: PocketOpeningSchema
  referencePocket: PocketSchema | undefined
}

export const PocketOpeningEditor: FC<PocketOpeningEditorProps> = ({
  opening,
  referencePocket,
  editable,
  issues: incomingIssues,
  onChange,
}) => {
  const limitIssues = usePocketOpeningLimitIssues(opening, referencePocket)
  const issues = useCombinedIssues<PocketOpeningSchema>(incomingIssues, limitIssues)

  switch (editable.type) {
    case 'straight':
      return (
        <StraightPocketOpeningEditor
          opening={opening as StraightPocketOpeningSchema}
          referencePocket={referencePocket}
        />
      )
    case 'recessed':
      return (
        <RecessedPocketOpeningEditor
          opening={opening as RecessedPocketOpeningSchema}
          referencePocket={referencePocket}
          editable={editable}
          issues={issues as IssuesSchema<RecessedPocketOpeningSchema>}
          onChange={onChange}
        />
      )
    case 'slanted':
      return (
        <SlantedPocketOpeningEditor
          opening={opening as SlantedPocketOpeningSchema}
          referencePocket={referencePocket}
          editable={editable}
          issues={issues as IssuesSchema<SlantedPocketOpeningSchema>}
          onChange={onChange}
        />
      )
    case 'optical-illusion':
      return (
        <OpticalIllusionPocketOpeningEditor
          opening={opening as OpticalIllusionPocketOpeningSchema}
          referencePocket={referencePocket}
          editable={editable}
          issues={issues as IssuesSchema<OpticalIllusionPocketOpeningSchema>}
          onChange={onChange}
        />
      )
  }
}
