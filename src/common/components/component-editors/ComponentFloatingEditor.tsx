import type { FC, ReactElement } from 'react'
import { IdentityFloatingEditorHeader } from '../common/IdentityFloatingEditorHeader'

import { useEditableModelsContext } from '../../contexts/EditableModelsContext'
import { useSubProject } from '../../hooks/useSubProject'
import type { HasTargetSchema } from '../../schemas/common'
import type { BaseComponentSchema, ComponentSchema } from '../../schemas/components'
import type { FloatingEditorAnchor } from '../../utils/floatingEditorAnchorUtils'
import { getModelIcon } from '../../utils/getModelIcon'
import { ComponentActionsMenu } from '../action-menus/ComponentActionsMenu'
import { FloatingEditor } from '../common/FloatingEditor'
import { ComponentEditor } from './ComponentEditor'
import { ComponentFloatingEditorHeader } from './ComponentFloatingEditorHeader'
import { RootPanelFloatingEditorHeader } from './RootPanelFloatingEditorHeader'

type ComponentFloatingEditorProps = {
  anchorElement: FloatingEditorAnchor
  onAdd: (target: HasTargetSchema) => void
  onClose: () => void
}

export const ComponentFloatingEditor: FC<ComponentFloatingEditorProps> = ({ anchorElement, onAdd, onClose }) => {
  const { subProject } = useSubProject()

  const { selectedModelId, models } = useEditableModelsContext<ComponentSchema>()
  const editedComponent = models[selectedModelId]

  const menu = (
    <ComponentActionsMenu
      component={editedComponent}
      onAddChild={onAdd}
      onAddHole={onAdd}
      onAddStitchLine={onAdd}
      onDelete={onClose}
      size="xs"
      subProject={subProject}
    />
  )

  return (
    <FloatingEditor anchorElement={anchorElement} onClose={onClose}>
      <ComponentHeader menu={menu} />
      <ComponentEditor />
    </FloatingEditor>
  )
}

type ComponentHeaderProps = {
  menu: ReactElement
}

const ComponentHeader: FC<ComponentHeaderProps> = ({ menu }) => {
  const { selectedModelId, models, editableModels, validationIssues, setModel } =
    useEditableModelsContext<ComponentSchema>()
  const { subProject } = useSubProject()
  const editableComponent = editableModels[selectedModelId]
  const issues = validationIssues[selectedModelId]
  const setComponent = setModel[selectedModelId]
  const Icon = getModelIcon(models[selectedModelId], subProject)

  switch (editableComponent.type) {
    case 'root-panel':
      return <RootPanelFloatingEditorHeader icon={<Icon />} menu={menu} />
    case 'guide':
      return (
        <IdentityFloatingEditorHeader<ComponentSchema>
          icon={<Icon />}
          menu={menu}
          editable={editableComponent}
          issues={issues}
          onChange={setComponent}
        />
      )
    case 'root-panel-face':
    case 'panel':
    case 'pocket-cluster':
    case 'front-pocket':
    case 't-pocket':
      return (
        <ComponentFloatingEditorHeader<ComponentSchema & BaseComponentSchema>
          editable={editableComponent}
          icon={<Icon />}
          issues={issues}
          menu={menu}
          onChange={setComponent}
        />
      )
  }
}
