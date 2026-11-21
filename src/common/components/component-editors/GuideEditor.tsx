import type { FC } from 'react'
import type { GuideSchema } from '../../schemas/components'
import type { EditableSchema } from '../../schemas/editable'
import type { IssuesSchema } from '../../schemas/issues'
import { SectionGroup } from '../common/SectionGroup'
import { AnchoredPositionSection } from './sections/AnchoredPositionSection'
import { AutoSizeSection } from './sections/AutoSizeSection'
import { CornerRadiusSection } from './sections/CornerRadiusSection'
import { LayoutSection } from './sections/LayoutSection'
import { StretchSection } from './sections/StretchSection'

type GuideEditorProps = {
  component: GuideSchema
  editable: EditableSchema<GuideSchema>
  issues: IssuesSchema<GuideSchema>
  onChange: (updated: EditableSchema<GuideSchema>) => void
}

export const GuideEditor: FC<GuideEditorProps> = ({ component, editable, issues, onChange }) => (
  <SectionGroup.Root>
    <AutoSizeSection<GuideSchema>
      modelId={editable.id}
      component={component}
      editable={editable}
      issues={issues}
      onChange={onChange}
    />
    <AnchoredPositionSection<GuideSchema>
      modelId={editable.id}
      editable={editable}
      issues={issues}
      onChange={onChange}
    />
    <StretchSection<GuideSchema> modelId={editable.id} editable={editable} issues={issues} onChange={onChange} />
    <CornerRadiusSection<GuideSchema> modelId={editable.id} editable={editable} issues={issues} onChange={onChange} />
    <LayoutSection<GuideSchema>
      modelId={editable.id}
      component={component}
      editable={editable}
      issues={issues}
      onChange={onChange}
    />
  </SectionGroup.Root>
)
