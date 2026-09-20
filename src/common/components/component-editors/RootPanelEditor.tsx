import { FC } from 'react'
import type { RootPanelSchema } from '../../schemas/components'
import type { EditableSchema } from '../../schemas/editable'
import type { ValidationIssuesSchema } from '../../schemas/validation'
import { SectionGroup } from '../common/SectionGroup'
import { CornerRadiusSection } from './sections/CornerRadiusSection'
import { LayoutSection } from './sections/LayoutSection'
import { SizeSection } from './sections/SizeSection'

type RootPanelEditorProps = {
  component: RootPanelSchema
  editable: EditableSchema<RootPanelSchema>
  issues: ValidationIssuesSchema<RootPanelSchema>
  onChange: (updated: EditableSchema<RootPanelSchema>) => void
}

export const RootPanelEditor: FC<RootPanelEditorProps> = ({ component, editable, issues, onChange }) => {
  return (
    <SectionGroup.Root>
      <SizeSection<RootPanelSchema> editable={editable} issues={issues} onChange={onChange} />
      <CornerRadiusSection<RootPanelSchema> value={component} editable={editable} issues={issues} onChange={onChange} />
      <LayoutSection component={component} editable={editable} issues={issues} onChange={onChange} />
    </SectionGroup.Root>
  )
}
