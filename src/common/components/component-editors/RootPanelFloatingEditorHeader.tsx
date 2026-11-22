import type { FC, ReactElement, ReactNode } from 'react'
import { useEditableModelsContext } from '../../contexts/EditableModelsContext'
import { useRootPanelFace } from '../../hooks/useRootPanelFace'
import type { ComponentSchema, RootPanelSchema } from '../../schemas/components'
import type { EditableSchema } from '../../schemas/editable'
import type { IssuesSchema } from '../../schemas/issues'
import { narrowers } from '../../utils/narrowers'
import { ComponentColorInput } from '../common/ComponentColorInput'
import { IdentityFloatingEditorHeader } from '../common/IdentityFloatingEditorHeader'

type RootPanelFloatingEditorHeaderProps = {
  icon: ReactNode
  menu: ReactElement
}

export const RootPanelFloatingEditorHeader: FC<RootPanelFloatingEditorHeaderProps> = ({ icon, menu }) => {
  const { selectedModelId, models, editableModels, validationIssues, setModel } =
    useEditableModelsContext<ComponentSchema>()
  const root = narrowers.assert.rootPanel(models[selectedModelId])
  const { face } = useRootPanelFace()

  return (
    <IdentityFloatingEditorHeader<RootPanelSchema>
      editable={editableModels[root.id] as EditableSchema<RootPanelSchema>}
      issues={validationIssues[root.id] as IssuesSchema<RootPanelSchema>}
      onChange={setModel[root.id]}
      icon={icon}
      menu={menu}
      rightAddon={<ComponentColorInput modelId={face.id} />}
    />
  )
}
