import { FC } from 'react'

import type { ComponentSchema, PanelSchema, PocketClusterSchema, RootPanelSchema } from '../../schemas/components'
import type { EditableSchema } from '../../schemas/editable'
import type { ValidationIssuesSchema } from '../../schemas/validation'
import { isDefined } from '../../utils/isDefined'
import { PanelEditor } from './PanelEditor'
import { PocketClusterEditor } from './PocketClusterEditor'
import { RootPanelEditor } from './RootPanelEditor'

type ComponentEditorProps = {
  component: ComponentSchema
  editable: EditableSchema<ComponentSchema>
  issues: ValidationIssuesSchema<ComponentSchema>
  onChange: (updated: EditableSchema<ComponentSchema>) => void
  parent: ComponentSchema | undefined
}

export const ComponentEditor: FC<ComponentEditorProps> = (props) => {
  switch (props.editable.type) {
    case 'root-panel':
      return (
        <RootPanelEditor
          component={props.component as RootPanelSchema}
          editable={props.editable}
          issues={props.issues as ValidationIssuesSchema<RootPanelSchema>}
          onChange={props.onChange}
        />
      )
    case 'panel':
      if (!isDefined(props.parent)) {
        throw new Error('Panel parent not found')
      }
      return (
        <PanelEditor
          component={props.component as PanelSchema}
          editable={props.editable}
          issues={props.issues as ValidationIssuesSchema<PanelSchema>}
          onChange={props.onChange}
          parent={props.parent}
        />
      )
    case 'pocket-cluster':
      if (!isDefined(props.parent)) {
        throw new Error('Pocket cluster parent not found')
      }
      return (
        <PocketClusterEditor
          component={props.component as PocketClusterSchema}
          editable={props.editable}
          issues={props.issues as ValidationIssuesSchema<PocketClusterSchema>}
          onChange={props.onChange}
          parent={props.parent}
        />
      )
  }
}
