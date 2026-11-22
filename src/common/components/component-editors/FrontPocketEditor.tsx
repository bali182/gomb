import { Tabs } from '@chakra-ui/react'
import { useCallback, useMemo, type FC } from 'react'
import { PocketEditorTabs } from '../../constants/editorTabs'
import { useEditableModelsContext } from '../../contexts/EditableModelsContext'
import { useCombinedIssues } from '../../hooks/useCombinedIssues'
import { useComponentLimitIssues } from '../../hooks/useComponentLimitIssues'
import { useFloatingEditorTab } from '../../hooks/useFloatingEditorTab'
import { useSubProject } from '../../hooks/useSubProject'
import { useTranslation } from '../../hooks/useTranslation'
import type { HasCornerRadiusSchema } from '../../schemas/common'
import type { FrontPocketSchema } from '../../schemas/components'
import type { IssuesSchema } from '../../schemas/issues'
import { narrowers } from '../../utils/narrowers'
import { SectionGroup } from '../common/SectionGroup'
import { ContentsSection } from './sections/ContentsSection'
import { CornerRadiusSection } from './sections/CornerRadiusSection'
import { LayoutSection } from './sections/LayoutSection'
import { PocketOpeningSection } from './sections/PocketOpeningSection'

export const FrontPocketEditor: FC = () => {
  const { t } = useTranslation()
  const { selectedModelId, models, editableModels, validationIssues, setModel } =
    useEditableModelsContext<FrontPocketSchema>()
  const component = models[selectedModelId]
  const { accessor } = useSubProject()
  const parent = narrowers.assert.pocketCluster(accessor.component.parent(component.id))
  const editable = editableModels[selectedModelId]
  const onChange = setModel[selectedModelId]
  const limitIssues = useComponentLimitIssues(component)

  const issues = useCombinedIssues<FrontPocketSchema>(
    validationIssues[selectedModelId],
    limitIssues as IssuesSchema<FrontPocketSchema>,
  )

  const { activeTab, onTabChange } = useFloatingEditorTab({
    modelId: component.id,
    defaultTab: PocketEditorTabs.layout,
    tabs: PocketEditorTabs,
  })

  const handleOpeningIdChange = useCallback(
    (openingId: string): void => onChange({ ...editable, openingId }),
    [editable, onChange],
  )

  const disabledFields = useMemo<readonly (keyof HasCornerRadiusSchema)[]>(() => {
    switch (parent.orientation) {
      case 'up':
        return ['topLeftRadius', 'topRightRadius']
      case 'down':
        return ['bottomLeftRadius', 'bottomRightRadius']
      case 'left':
        return ['topLeftRadius', 'bottomLeftRadius']
      case 'right':
        return ['topRightRadius', 'bottomRightRadius']
    }
  }, [parent.orientation])
  return (
    <Tabs.Root value={activeTab} onValueChange={onTabChange}>
      <Tabs.List alignItems="center" pr="2">
        <Tabs.Trigger value={PocketEditorTabs.layout}>{t.project.editors.tabs.components.layout}</Tabs.Trigger>
        <Tabs.Trigger value={PocketEditorTabs.contents}>{t.project.editors.tabs.components.contents}</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value={PocketEditorTabs.layout} pt={0}>
        <SectionGroup.Root>
          <CornerRadiusSection<FrontPocketSchema>
            modelId={editable.id}
            editable={editable}
            issues={issues}
            onChange={onChange}
            disabledFields={disabledFields}
          />
          <LayoutSection
            modelId={editable.id}
            component={component}
            editable={editable}
            issues={issues}
            onChange={onChange}
          />
          <PocketOpeningSection
            pocketId={component.id}
            openingId={editable.openingId}
            onOpeningIdChange={handleOpeningIdChange}
          />
        </SectionGroup.Root>
      </Tabs.Content>
      <Tabs.Content value={PocketEditorTabs.contents} pt={0}>
        <SectionGroup.Root>
          <ContentsSection<FrontPocketSchema>
            modelId={editable.id}
            orientation={parent.orientation}
            editable={editable}
            issues={issues}
            onChange={onChange}
          />
        </SectionGroup.Root>
      </Tabs.Content>
    </Tabs.Root>
  )
}
