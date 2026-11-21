import type { FC } from 'react'
import type { RootPanelFaceSchema } from '../../schemas/components'
import type { EditableSchema } from '../../schemas/editable'
import type { IssuesSchema } from '../../schemas/issues'
import { SectionGroup } from '../common/SectionGroup'
import { LayoutSection } from './sections/LayoutSection'

type RootPanelFaceEditorProps = {
  component: RootPanelFaceSchema
  editable: EditableSchema<RootPanelFaceSchema>
  issues: IssuesSchema<RootPanelFaceSchema>
  onChange: (updated: EditableSchema<RootPanelFaceSchema>) => void
}

export const RootPanelFaceEditor: FC<RootPanelFaceEditorProps> = ({ component, editable, issues, onChange }) => (
  <SectionGroup.Root>
    <LayoutSection
      modelId={component.id}
      component={component}
      editable={editable}
      issues={issues}
      onChange={onChange}
    />
  </SectionGroup.Root>
)
