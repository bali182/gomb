import { FC } from 'react'
import type { ComponentSchema, PanelSchema } from '../../schemas/components'
import type { EditableSchema } from '../../schemas/editable'
import type { ValidationIssuesSchema } from '../../schemas/validation'
import { SectionGroup } from '../common/SectionGroup'
import { AnchorSection } from './sections/AnchorSection'
import { CornerRadiusSection } from './sections/CornerRadiusSection'
import { FillableSizeSection } from './sections/FillableSizeSection'
import { LayoutSection } from './sections/LayoutSection'
import { SqueezeSection } from './sections/SqueezeSection'

type PanelEditorProps = {
  component: PanelSchema
  editable: EditableSchema<PanelSchema>
  issues: ValidationIssuesSchema<PanelSchema>
  onChange: (updated: EditableSchema<PanelSchema>) => void
  parent: ComponentSchema
}

export const PanelEditor: FC<PanelEditorProps> = ({ component, editable, issues, onChange, parent }) => {
  return (
    <SectionGroup.Root>
      <FillableSizeSection component={component} editable={editable} issues={issues} onChange={onChange} />
      <AnchorSection<PanelSchema> parent={parent} editable={editable} issues={issues} onChange={onChange} />
      <SqueezeSection component={component} editable={editable} issues={issues} onChange={onChange} />
      <CornerRadiusSection<PanelSchema> value={component} editable={editable} issues={issues} onChange={onChange} />
      <LayoutSection component={component} editable={editable} issues={issues} onChange={onChange} />
    </SectionGroup.Root>
  )
}
