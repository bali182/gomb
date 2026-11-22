import { FC } from 'react'
import { useCombinedIssues } from '../../hooks/useCombinedIssues'
import { useComponentLimitIssues } from '../../hooks/useComponentLimitIssues'
import { useEditableComponent } from '../../hooks/useEditableComponent'
import { useRootPanelFace } from '../../hooks/useRootPanelFace'
import type { RootPanelFaceSchema, RootPanelSchema } from '../../schemas/components'
import type { EditableSchema } from '../../schemas/editable'
import type { IssuesSchema } from '../../schemas/issues'
import { narrowers } from '../../utils/narrowers'
import { SectionGroup } from '../common/SectionGroup'
import { CornerRadiusSection } from './sections/CornerRadiusSection'
import { LayoutSection } from './sections/LayoutSection'
import { SizeSection } from './sections/SizeSection'

type RootPanelEditorProps = {
  editable: EditableSchema<RootPanelSchema>
  issues: IssuesSchema<RootPanelSchema>
  onChange: (updated: EditableSchema<RootPanelSchema>) => void
}

export const RootPanelEditor: FC<RootPanelEditorProps> = ({ editable, issues, onChange }) => {
  const { face } = useRootPanelFace()
  const faceEditor = useEditableComponent(face.id)
  const editedFace = narrowers.assert.rootPanelFace(faceEditor.component)
  const faceLimitIssues = useComponentLimitIssues(editedFace)
  const faceIssues = useCombinedIssues<RootPanelFaceSchema>(
    faceEditor.validationIssues as IssuesSchema<RootPanelFaceSchema>,
    faceLimitIssues as IssuesSchema<RootPanelFaceSchema>,
  )

  return (
    <SectionGroup.Root>
      <SizeSection<RootPanelSchema> modelId={editable.id} editable={editable} issues={issues} onChange={onChange} />
      <CornerRadiusSection<RootPanelSchema>
        modelId={editable.id}
        editable={editable}
        issues={issues}
        onChange={onChange}
      />
      <LayoutSection<RootPanelFaceSchema>
        tag={editedFace.name}
        modelId={face.id}
        component={editedFace}
        editable={faceEditor.editableComponent as EditableSchema<RootPanelFaceSchema>}
        issues={faceIssues}
        onChange={faceEditor.setComponent}
      />
    </SectionGroup.Root>
  )
}
