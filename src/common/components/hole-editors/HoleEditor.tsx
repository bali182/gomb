import { type FC } from 'react'

import { useCombinedIssues } from '../../hooks/useCombinedIssues'
import { useHoleLimitIssues } from '../../hooks/useHoleLimitIssues'
import type { EditableSchema } from '../../schemas/editable'
import type { HoleSchema } from '../../schemas/hole'
import type { IssuesSchema } from '../../schemas/issues'
import { SectionGroup } from '../common/SectionGroup'
import { AnchoredPositionSection } from '../component-editors/sections/AnchoredPositionSection'
import { AutoSizeSection } from '../component-editors/sections/AutoSizeSection'
import { CornerRadiusSection } from '../component-editors/sections/CornerRadiusSection'
import { StretchSection } from '../component-editors/sections/StretchSection'

type HoleEditorProps = {
  editable: EditableSchema<HoleSchema>
  hole: HoleSchema
  issues: IssuesSchema<HoleSchema>
  onChange: (updated: EditableSchema<HoleSchema>) => void
}

export const HoleEditor: FC<HoleEditorProps> = ({ editable, hole, issues: incomingIssues, onChange }) => {
  const limitIssues = useHoleLimitIssues(hole)
  const issues = useCombinedIssues<HoleSchema>(incomingIssues, limitIssues)

  return (
    <SectionGroup.Root>
      <AnchoredPositionSection<HoleSchema>
        modelId={editable.id}
        editable={editable}
        issues={issues}
        onChange={onChange}
      />
      <AutoSizeSection<HoleSchema>
        modelId={editable.id}
        component={hole}
        editable={editable}
        issues={issues}
        onChange={onChange}
      />
      <StretchSection<HoleSchema> modelId={editable.id} editable={editable} issues={issues} onChange={onChange} />
      <CornerRadiusSection<HoleSchema> modelId={editable.id} editable={editable} issues={issues} onChange={onChange} />
    </SectionGroup.Root>
  )
}
