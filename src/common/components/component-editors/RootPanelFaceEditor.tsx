import type { FC } from 'react'
import { useCombinedIssues } from '../../hooks/useCombinedIssues'
import { useComponentLimitIssues } from '../../hooks/useComponentLimitIssues'
import { useEditableComponent } from '../../hooks/useEditableComponent'
import { useSubProject } from '../../hooks/useSubProject'
import type { RootPanelFaceSchema, RootPanelSchema } from '../../schemas/components'
import type { EditableSchema } from '../../schemas/editable'
import type { IssuesSchema } from '../../schemas/issues'
import { accessors } from '../../utils/accessors'
import { narrowers } from '../../utils/narrowers'
import { SectionGroup } from '../common/SectionGroup'
import { CornerRadiusSection } from './sections/CornerRadiusSection'
import { LayoutSection } from './sections/LayoutSection'
import { SizeSection } from './sections/SizeSection'

type RootPanelFaceEditorProps = {
  component: RootPanelFaceSchema
  editable: EditableSchema<RootPanelFaceSchema>
  issues: IssuesSchema<RootPanelFaceSchema>
  onChange: (updated: EditableSchema<RootPanelFaceSchema>) => void
}

export const RootPanelFaceEditor: FC<RootPanelFaceEditorProps> = ({ component, editable, issues, onChange }) => {
  const { subProject } = useSubProject()
  const root = narrowers.assert.rootPanel(accessors.subProject(subProject).component.parent(component.id))
  const rootEditor = useEditableComponent(root.id)
  const editedRoot = narrowers.assert.rootPanel(rootEditor.component)
  const rootEditable = rootEditor.editableComponent as EditableSchema<RootPanelSchema>
  const rootLimitIssues = useComponentLimitIssues(editedRoot)
  const rootIssues = useCombinedIssues<RootPanelSchema>(
    rootEditor.validationIssues as IssuesSchema<RootPanelSchema>,
    rootLimitIssues as IssuesSchema<RootPanelSchema>,
  )

  return (
    <SectionGroup.Root>
      <SizeSection<RootPanelSchema>
        tag={editedRoot.name}
        modelId={editedRoot.id}
        editable={rootEditable}
        issues={rootIssues}
        onChange={rootEditor.setComponent}
      />
      <CornerRadiusSection<RootPanelSchema>
        tag={editedRoot.name}
        modelId={editedRoot.id}
        editable={rootEditable}
        issues={rootIssues}
        onChange={rootEditor.setComponent}
      />
      <LayoutSection<RootPanelFaceSchema>
        modelId={component.id}
        component={component}
        editable={editable}
        issues={issues}
        onChange={onChange}
      />
    </SectionGroup.Root>
  )
}
