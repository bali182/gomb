import type { ReactElement, ReactNode } from 'react'
import type { BaseComponentSchema, ComponentSchema } from '../../schemas/components'
import type { EditableSchema } from '../../schemas/editable'
import type { IssuesSchema } from '../../schemas/issues'
import { ComponentColorInput } from '../common/ComponentColorInput'
import { IdentityFloatingEditorHeader } from '../common/IdentityFloatingEditorHeader'

type ComponentFloatingEditorHeaderProps<T extends ComponentSchema & BaseComponentSchema> = {
  editable: EditableSchema<T>
  icon: ReactNode
  issues: IssuesSchema<T>
  menu: ReactElement
  onChange: (updated: EditableSchema<T>) => void
}

export const ComponentFloatingEditorHeader = <T extends ComponentSchema & BaseComponentSchema>({
  editable,
  icon,
  issues,
  menu,
  onChange,
}: ComponentFloatingEditorHeaderProps<T>) => (
  <IdentityFloatingEditorHeader
    editable={editable}
    icon={icon}
    issues={issues}
    menu={menu}
    onChange={onChange}
    rightAddon={<ComponentColorInput modelId={editable.id} />}
  />
)
