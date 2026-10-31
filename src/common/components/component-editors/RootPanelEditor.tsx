import { FC } from 'react'
import type { RootPanelSchema } from '../../schemas/components'
import type { EditableSchema } from '../../schemas/editable'
import type { IssuesSchema } from '../../schemas/issues'
import { SectionGroup } from '../common/SectionGroup'
import { CornerRadiusSection } from './sections/CornerRadiusSection'
import { LayoutSection } from './sections/LayoutSection'
import { SizeSection } from './sections/SizeSection'

type RootPanelEditorProps = {
  component: RootPanelSchema
  editable: EditableSchema<RootPanelSchema>
  issues: IssuesSchema<RootPanelSchema>
  onChange: (updated: EditableSchema<RootPanelSchema>) => void
}

export const RootPanelEditor: FC<RootPanelEditorProps> = ({ component, editable, issues, onChange }) => {
  return (
    <SectionGroup.Root>
      <SizeSection<RootPanelSchema> modelId={editable.id} editable={editable} issues={issues} onChange={onChange} />
      <CornerRadiusSection<RootPanelSchema>
        modelId={editable.id}
        value={component}
        editable={editable}
        issues={issues}
        onChange={onChange}
      />
      <LayoutSection
        modelId={editable.id}
        component={component}
        editable={editable}
        issues={issues}
        onChange={onChange}
      />
    </SectionGroup.Root>
  )
}
