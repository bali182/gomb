import { FC } from 'react'
import { useEditableComponent } from '../../hooks/useEditableComponent'
import { useRootPanelFace } from '../../hooks/useRootPanelFace'
import { useTranslation } from '../../hooks/useTranslation'
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
  const { t } = useTranslation()
  const faceEditor = useEditableComponent(face.id)
  const editedFace = narrowers.assert.rootPanelFace(faceEditor.component)
  return (
    <SectionGroup.Root>
      <SizeSection<RootPanelSchema> modelId={editable.id} editable={editable} issues={issues} onChange={onChange} />
      <CornerRadiusSection<RootPanelSchema>
        modelId={editable.id}
        editable={editable}
        issues={issues}
        onChange={onChange}
      />
      <LayoutSection
        title={t.project.editors.faceLayoutTitle(editedFace.name)}
        modelId={face.id}
        component={editedFace}
        editable={faceEditor.editableComponent as EditableSchema<RootPanelFaceSchema>}
        issues={faceEditor.validationIssues as IssuesSchema<RootPanelFaceSchema>}
        onChange={faceEditor.setComponent}
      />
    </SectionGroup.Root>
  )
}
