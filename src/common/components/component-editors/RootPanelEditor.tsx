import { FC } from 'react'
import { useEditableModelsContext } from '../../contexts/EditableModelsContext'
import { useCombinedIssues } from '../../hooks/useCombinedIssues'
import { useComponentLimitIssues } from '../../hooks/useComponentLimitIssues'
import { useRootPanelFace } from '../../hooks/useRootPanelFace'
import type { ComponentSchema, RootPanelFaceSchema, RootPanelSchema } from '../../schemas/components'
import type { EditableSchema } from '../../schemas/editable'
import type { IssuesSchema } from '../../schemas/issues'
import { narrowers } from '../../utils/narrowers'
import { SectionGroup } from '../common/SectionGroup'
import { CornerRadiusSection } from './sections/CornerRadiusSection'
import { LayoutSection } from './sections/LayoutSection'
import { SizeSection } from './sections/SizeSection'

export const RootPanelEditor: FC = () => {
  const { selectedModelId, models, editableModels, validationIssues, setModel } =
    useEditableModelsContext<ComponentSchema>()

  const root = narrowers.assert.rootPanel(models[selectedModelId])
  const rootEditable = editableModels[root.id] as EditableSchema<RootPanelSchema>
  const onChange = setModel[root.id]
  const rootLimitIssues = useComponentLimitIssues(root)
  const rootIssues = useCombinedIssues<RootPanelSchema>(
    validationIssues[root.id] as IssuesSchema<RootPanelSchema>,
    rootLimitIssues as IssuesSchema<RootPanelSchema>,
  )

  const { face } = useRootPanelFace()
  const editedFace = narrowers.assert.rootPanelFace(models[face.id])
  const faceLimitIssues = useComponentLimitIssues(editedFace)
  const faceIssues = useCombinedIssues<RootPanelFaceSchema>(
    validationIssues[face.id] as IssuesSchema<RootPanelFaceSchema>,
    faceLimitIssues as IssuesSchema<RootPanelFaceSchema>,
  )

  return (
    <SectionGroup.Root>
      <SizeSection<RootPanelSchema>
        modelId={rootEditable.id}
        editable={rootEditable}
        issues={rootIssues}
        onChange={onChange}
      />
      <CornerRadiusSection<RootPanelSchema>
        modelId={rootEditable.id}
        editable={rootEditable}
        issues={rootIssues}
        onChange={onChange}
      />
      <LayoutSection<RootPanelFaceSchema>
        tag={editedFace.name}
        modelId={face.id}
        component={editedFace}
        editable={editableModels[face.id] as EditableSchema<RootPanelFaceSchema>}
        issues={faceIssues}
        onChange={setModel[face.id]}
      />
    </SectionGroup.Root>
  )
}
