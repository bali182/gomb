import { useCallback, type FC } from 'react'
import { accessors } from '../../utils/accessors'
import { IdentityFloatingEditorHeader } from '../common/IdentityFloatingEditorHeader'

import { useEditableComponent } from '../../hooks/useEditableComponent'
import { useProject } from '../../hooks/useProject'
import { useSubProject } from '../../hooks/useSubProject'
import type { HasTargetSchema } from '../../schemas/common'
import type { BaseComponentSchema, ComponentSchema } from '../../schemas/components'
import type { FloatingEditorAnchor } from '../../utils/floatingEditorAnchorUtils'
import { getModelIcon } from '../../utils/getModelIcon'
import { ComponentActionsMenu } from '../action-menus/ComponentActionsMenu'
import { FloatingEditor } from '../common/FloatingEditor'
import { ComponentEditor } from './ComponentEditor'
import { ComponentFloatingEditorHeader } from './ComponentFloatingEditorHeader'

type ComponentFloatingEditorProps = {
  anchorElement: FloatingEditorAnchor
  component: ComponentSchema
  onAdd: (target: HasTargetSchema) => void
  onClose: () => void
}

export const ComponentFloatingEditor: FC<ComponentFloatingEditorProps> = ({
  anchorElement,
  component,
  onAdd,
  onClose,
}) => {
  const { project } = useProject()
  const { subProject } = useSubProject()

  const parent = accessors.subProject(subProject).optional.component.parent(component.id)

  const {
    component: editedComponent,
    editableComponent,
    setComponent,
    setComponentImmediately,
    validationIssues,
  } = useEditableComponent(component.id)

  const Icon = getModelIcon(editedComponent, subProject)

  const handleColorReset = useCallback((): void => {
    if (editableComponent.type === 'root-panel-face' || editableComponent.type === 'guide') {
      return
    }
    const updatedEditable = { ...editableComponent }
    delete updatedEditable.color
    setComponent(updatedEditable)
  }, [editableComponent, setComponent])

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
      {editableComponent.type === 'root-panel-face' || editableComponent.type === 'guide' ? (
        <IdentityFloatingEditorHeader
          icon={<Icon />}
          menu={menu}
          editable={editableComponent}
          issues={validationIssues}
          onChange={setComponent}
        />
      ) : (
        <ComponentFloatingEditorHeader<ComponentSchema & BaseComponentSchema>
          baseColor={project.colorSettings.leatherColor}
          editable={editableComponent}
          icon={<Icon />}
          issues={validationIssues}
          menu={menu}
          onChange={setComponent}
          onResetColor={handleColorReset}
        />
      )}
      <ComponentEditor
        component={editedComponent}
        editable={editableComponent}
        issues={validationIssues}
        onChange={setComponent}
        onChangeImmediately={setComponentImmediately}
        parent={parent}
      />
    </FloatingEditor>
  )
}
