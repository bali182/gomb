import type { FC } from 'react'
import { useEditableModelsContext } from '../../contexts/EditableModelsContext'
import { useCombinedIssues } from '../../hooks/useCombinedIssues'
import { useComponentLimitIssues } from '../../hooks/useComponentLimitIssues'
import { useSubProject } from '../../hooks/useSubProject'
import type { ComponentSchema, RootPanelFaceSchema, RootPanelSchema } from '../../schemas/components'
import type { EditableSchema } from '../../schemas/editable'
import type { IssuesSchema } from '../../schemas/issues'
import { narrowers } from '../../utils/narrowers'
import { SectionGroup } from '../common/SectionGroup'
import { CornerRadiusSection } from './sections/CornerRadiusSection'
import { LayoutSection } from './sections/LayoutSection'
import { SizeSection } from './sections/SizeSection'

export const RootPanelFaceEditor: FC = () => {
  const { selectedModelId, models, editableModels, validationIssues, setModel } =
    useEditableModelsContext<ComponentSchema>()
  const component = narrowers.assert.rootPanelFace(models[selectedModelId])
  const editable = editableModels[component.id] as EditableSchema<RootPanelFaceSchema>
  const onChange = setModel[component.id]
  const faceLimitIssues = useComponentLimitIssues(component)
  const faceIssues = useCombinedIssues<RootPanelFaceSchema>(
    validationIssues[component.id] as IssuesSchema<RootPanelFaceSchema>,
    faceLimitIssues as IssuesSchema<RootPanelFaceSchema>,
  )

  const { accessor } = useSubProject()
  const root = narrowers.assert.rootPanel(accessor.component.parent(component.id))
  const editedRoot = narrowers.assert.rootPanel(models[root.id])
  const rootEditable = editableModels[root.id] as EditableSchema<RootPanelSchema>
  const rootLimitIssues = useComponentLimitIssues(editedRoot)
  const rootIssues = useCombinedIssues<RootPanelSchema>(
    validationIssues[root.id] as IssuesSchema<RootPanelSchema>,
    rootLimitIssues as IssuesSchema<RootPanelSchema>,
  )

  return (
    <SectionGroup.Root>
      <SizeSection<RootPanelSchema>
        tag={editedRoot.name}
        modelId={editedRoot.id}
        editable={rootEditable}
        issues={rootIssues}
        onChange={setModel[root.id]}
      />
      <CornerRadiusSection<RootPanelSchema>
        tag={editedRoot.name}
        modelId={editedRoot.id}
        editable={rootEditable}
        issues={rootIssues}
        onChange={setModel[root.id]}
      />
      <LayoutSection<RootPanelFaceSchema>
        modelId={component.id}
        component={component}
        editable={editable}
        issues={faceIssues}
        onChange={onChange}
      />
    </SectionGroup.Root>
  )
}
