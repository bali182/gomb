import { FC } from 'react'
import { useEditableModelsContext } from '../../contexts/EditableModelsContext'
import { useCombinedIssues } from '../../hooks/useCombinedIssues'
import { useComponentLimitIssues } from '../../hooks/useComponentLimitIssues'
import { useSubProject } from '../../hooks/useSubProject'
import type { PanelSchema } from '../../schemas/components'
import type { IssuesSchema } from '../../schemas/issues'
import { SectionGroup } from '../common/SectionGroup'
import { AnchorSection } from './sections/AnchorSection'
import { AutoSizeSection } from './sections/AutoSizeSection'
import { CornerRadiusSection } from './sections/CornerRadiusSection'
import { LayoutSection } from './sections/LayoutSection'
import { StretchSection } from './sections/StretchSection'

export const PanelEditor: FC = () => {
  const { selectedModelId, models, editableModels, validationIssues, setModel } =
    useEditableModelsContext<PanelSchema>()

  const component = models[selectedModelId]
  const { accessor } = useSubProject()
  const parent = accessor.component.parent(component.id)
  const editable = editableModels[selectedModelId]
  const onChange = setModel[selectedModelId]
  const limitIssues = useComponentLimitIssues(component)

  const issues = useCombinedIssues<PanelSchema>(
    validationIssues[selectedModelId],
    limitIssues as IssuesSchema<PanelSchema>,
  )

  return (
    <SectionGroup.Root>
      <AutoSizeSection
        modelId={editable.id}
        component={component}
        editable={editable}
        issues={issues}
        onChange={onChange}
      />
      <AnchorSection<PanelSchema> parent={parent} editable={editable} issues={issues} onChange={onChange} />
      <StretchSection<PanelSchema> modelId={editable.id} editable={editable} issues={issues} onChange={onChange} />
      <CornerRadiusSection<PanelSchema> modelId={editable.id} editable={editable} issues={issues} onChange={onChange} />
      <LayoutSection
        modelId={editable.id}
        component={component}
        editable={editable}
        issues={issues}
        onChange={onChange}
      />
    </SectionGroup.Root>
  )
}
