import type { FC } from 'react'
import { useEditableModelsContext } from '../../contexts/EditableModelsContext'
import { useCombinedIssues } from '../../hooks/useCombinedIssues'
import { useComponentLimitIssues } from '../../hooks/useComponentLimitIssues'
import type { GuideSchema } from '../../schemas/components'
import type { IssuesSchema } from '../../schemas/issues'
import { SectionGroup } from '../common/SectionGroup'
import { AnchoredPositionSection } from './sections/AnchoredPositionSection'
import { AutoSizeSection } from './sections/AutoSizeSection'
import { CornerRadiusSection } from './sections/CornerRadiusSection'
import { LayoutSection } from './sections/LayoutSection'
import { StretchSection } from './sections/StretchSection'

export const GuideEditor: FC = () => {
  const { selectedModelId, models, editableModels, validationIssues, setModel } =
    useEditableModelsContext<GuideSchema>()

  const component = models[selectedModelId]
  const editable = editableModels[selectedModelId]
  const onChange = setModel[selectedModelId]
  const limitIssues = useComponentLimitIssues(component)

  const issues = useCombinedIssues<GuideSchema>(
    validationIssues[selectedModelId],
    limitIssues as IssuesSchema<GuideSchema>,
  )

  return (
    <SectionGroup.Root>
      <AutoSizeSection<GuideSchema>
        modelId={editable.id}
        component={component}
        editable={editable}
        issues={issues}
        onChange={onChange}
      />
      <AnchoredPositionSection<GuideSchema>
        modelId={editable.id}
        editable={editable}
        issues={issues}
        onChange={onChange}
      />
      <StretchSection<GuideSchema> modelId={editable.id} editable={editable} issues={issues} onChange={onChange} />
      <CornerRadiusSection<GuideSchema> modelId={editable.id} editable={editable} issues={issues} onChange={onChange} />
      <LayoutSection<GuideSchema>
        modelId={editable.id}
        component={component}
        editable={editable}
        issues={issues}
        onChange={onChange}
      />
    </SectionGroup.Root>
  )
}
