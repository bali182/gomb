import { type FC } from 'react'

import { useCombinedIssues } from '../../hooks/useCombinedIssues'
import { useHoleLimitIssues } from '../../hooks/useHoleLimitIssues'
import type { EditableSchema } from '../../schemas/editable'
import type { HoleSchema } from '../../schemas/hole'
import type { IssuesSchema } from '../../schemas/issues'
import { SectionGroup } from '../common/SectionGroup'
import { CornerRadiusSection } from '../component-editors/sections/CornerRadiusSection'
import { SizeSection } from '../component-editors/sections/SizeSection'
import { HolePositionSection } from './sections/HolePositionSection'

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
      <HolePositionSection<HoleSchema> editable={editable} issues={issues} onChange={onChange} />
      <SizeSection<HoleSchema> editable={editable} issues={issues} onChange={onChange} />
      <CornerRadiusSection<HoleSchema> value={hole} editable={editable} issues={issues} onChange={onChange} />
    </SectionGroup.Root>
  )
}
