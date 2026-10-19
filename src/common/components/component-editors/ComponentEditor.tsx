import type { FC } from 'react'
import { useCombinedIssues } from '../../hooks/useCombinedIssues'
import { useComponentLimitIssues } from '../../hooks/useComponentLimitIssues'

import type { ImmediateUpdater } from '../../hooks/useEditableModel'
import type { ComponentSchema, PanelSchema, PocketClusterSchema, RootPanelSchema } from '../../schemas/components'
import type { EditableSchema } from '../../schemas/editable'
import type { IssuesSchema } from '../../schemas/issues'
import { isDefined } from '../../utils/isDefined'
import { PanelEditor } from './PanelEditor'
import { PocketClusterEditor } from './PocketClusterEditor'
import { RootPanelEditor } from './RootPanelEditor'

type ComponentEditorProps = {
  component: ComponentSchema
  editable: EditableSchema<ComponentSchema>
  issues: IssuesSchema<ComponentSchema>
  onChange: (updated: EditableSchema<ComponentSchema>) => void
  onChangeImmediately: (update: ImmediateUpdater<ComponentSchema>) => void
  parent: ComponentSchema | undefined
}

export const ComponentEditor: FC<ComponentEditorProps> = (props) => {
  const limitIssues = useComponentLimitIssues(props.component)
  const issues = useCombinedIssues<ComponentSchema>(props.issues, limitIssues)

  switch (props.editable.type) {
    case 'root-panel':
      return (
        <RootPanelEditor
          component={props.component as RootPanelSchema}
          editable={props.editable}
          issues={issues as IssuesSchema<RootPanelSchema>}
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
          issues={issues as IssuesSchema<PanelSchema>}
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
          issues={issues as IssuesSchema<PocketClusterSchema>}
          onChange={props.onChange}
          onChangeImmediately={props.onChangeImmediately as (update: ImmediateUpdater<PocketClusterSchema>) => void}
          parent={props.parent}
        />
      )
  }
}
