import { FC } from 'react'
import type { ComponentSchema, PanelSchema } from '../../schemas/components'
import type { EditableSchema } from '../../schemas/editable'
import type { IssuesSchema } from '../../schemas/issues'
import { SectionGroup } from '../common/SectionGroup'
import { AnchorSection } from './sections/AnchorSection'
import { AutoSizeSection } from './sections/AutoSizeSection'
import { CornerRadiusSection } from './sections/CornerRadiusSection'
import { LayoutSection } from './sections/LayoutSection'
import { StretchSection } from './sections/StretchSection'

type PanelEditorProps = {
  component: PanelSchema
  editable: EditableSchema<PanelSchema>
  issues: IssuesSchema<PanelSchema>
  onChange: (updated: EditableSchema<PanelSchema>) => void
  parent: ComponentSchema
}

export const PanelEditor: FC<PanelEditorProps> = ({ component, editable, issues, onChange, parent }) => {
  return (
    <SectionGroup.Root>
      <AutoSizeSection
        modelId={editable.id}
        component={component}
        editable={editable}
        issues={issues}
        onChange={onChange}
      />
      <AnchorSection<PanelSchema> parent={parent} editable={editable} issues={issues} onChange={onChange} />
      <StretchSection
        modelId={editable.id}
        component={component}
        editable={editable}
        issues={issues}
        onChange={onChange}
      />
      <CornerRadiusSection<PanelSchema>
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
