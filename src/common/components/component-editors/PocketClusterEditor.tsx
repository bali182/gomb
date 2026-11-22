import { useMemo, type FC } from 'react'
import { useEditableModelsContext } from '../../contexts/EditableModelsContext'
import { useCombinedIssues } from '../../hooks/useCombinedIssues'
import { useComponentLimitIssues } from '../../hooks/useComponentLimitIssues'
import { useSubProject } from '../../hooks/useSubProject'
import type { HasCornerRadiusSchema } from '../../schemas/common'
import type { PocketClusterSchema } from '../../schemas/components'
import type { IssuesSchema } from '../../schemas/issues'
import { isDefined } from '../../utils/isDefined'
import { SectionGroup } from '../common/SectionGroup'
import { PocketClusterEmptyState } from './PocketClusterEmptyState'
import { AnchorSection } from './sections/AnchorSection'
import { AutoSizeSection } from './sections/AutoSizeSection'
import { CornerRadiusSection } from './sections/CornerRadiusSection'
import { PocketsSection } from './sections/PocketsSection'
import { StretchSection } from './sections/StretchSection'

export const PocketClusterEditor: FC = () => {
  const { accessor } = useSubProject()

  const { selectedModelId, models, editableModels, validationIssues, setModel } =
    useEditableModelsContext<PocketClusterSchema>()

  const component = models[selectedModelId]
  const parent = accessor.component.parent(component.id)
  const editable = editableModels[selectedModelId]
  const onChange = setModel[selectedModelId]
  const limitIssues = useComponentLimitIssues(component)

  const issues = useCombinedIssues<PocketClusterSchema>(
    validationIssues[selectedModelId],
    limitIssues as IssuesSchema<PocketClusterSchema>,
  )

  const disabledFields = useMemo<readonly (keyof HasCornerRadiusSchema)[]>(() => {
    switch (component.orientation) {
      case 'up':
        return ['topLeftRadius', 'topRightRadius']
      case 'down':
        return ['bottomLeftRadius', 'bottomRightRadius']
      case 'left':
        return ['topLeftRadius', 'bottomLeftRadius']
      case 'right':
        return ['topRightRadius', 'bottomRightRadius']
    }
  }, [component.orientation])

  const hasFront = component.children.some((id) => {
    return isDefined(accessor.optional.component.frontPocket(id))
  })

  if (!hasFront) {
    return <PocketClusterEmptyState clusterId={component.id} />
  }
  return (
    <SectionGroup.Root>
      <PocketsSection component={component} editable={editable} issues={issues} onChange={onChange} />
      <AutoSizeSection
        modelId={editable.id}
        component={component}
        editable={editable}
        issues={issues}
        onChange={onChange}
      />
      <AnchorSection<PocketClusterSchema> parent={parent} editable={editable} issues={issues} onChange={onChange} />
      <CornerRadiusSection<PocketClusterSchema>
        modelId={editable.id}
        editable={editable}
        issues={issues}
        onChange={onChange}
        disabledFields={disabledFields}
      />
      <StretchSection<PocketClusterSchema>
        modelId={editable.id}
        editable={editable}
        issues={issues}
        onChange={onChange}
      />
    </SectionGroup.Root>
  )
}
