import { type FC } from 'react'

import { useEditableModelsContext } from '../../contexts/EditableModelsContext'
import { useCombinedIssues } from '../../hooks/useCombinedIssues'
import { useHoleLimitIssues } from '../../hooks/useHoleLimitIssues'
import type { HoleSchema } from '../../schemas/hole'
import { SectionGroup } from '../common/SectionGroup'
import { AnchoredPositionSection } from '../component-editors/sections/AnchoredPositionSection'
import { AutoSizeSection } from '../component-editors/sections/AutoSizeSection'
import { CornerRadiusSection } from '../component-editors/sections/CornerRadiusSection'
import { StretchSection } from '../component-editors/sections/StretchSection'

export const HoleEditor: FC = () => {
  const { selectedModelId, models, editableModels, validationIssues, setModel } = useEditableModelsContext<HoleSchema>()
  const hole = models[selectedModelId]
  const editable = editableModels[selectedModelId]
  const onChange = setModel[selectedModelId]
  const limitIssues = useHoleLimitIssues(hole)
  const issues = useCombinedIssues<HoleSchema>(validationIssues[selectedModelId], limitIssues)

  return (
    <SectionGroup.Root>
      <AnchoredPositionSection<HoleSchema>
        modelId={editable.id}
        editable={editable}
        issues={issues}
        onChange={onChange}
      />
      <AutoSizeSection<HoleSchema>
        modelId={editable.id}
        component={hole}
        editable={editable}
        issues={issues}
        onChange={onChange}
      />
      <StretchSection<HoleSchema> modelId={editable.id} editable={editable} issues={issues} onChange={onChange} />
      <CornerRadiusSection<HoleSchema> modelId={editable.id} editable={editable} issues={issues} onChange={onChange} />
    </SectionGroup.Root>
  )
}
