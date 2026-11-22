import { useCallback, type FC } from 'react'
import { StitchLineEditorTabs } from '../../constants/editorTabs'
import { useEditableModelsContext } from '../../contexts/EditableModelsContext'
import { useCombinedIssues } from '../../hooks/useCombinedIssues'
import { useResolvedEditableStitchLine } from '../../hooks/useResolvedEditableStitchLine'
import { useStitchLineLimitIssues } from '../../hooks/useStitchLineLimitIssues'

import { Tabs } from '@chakra-ui/react'
import { useFloatingEditorTab } from '../../hooks/useFloatingEditorTab'
import { useTranslation } from '../../hooks/useTranslation'
import type { IssuesSchema } from '../../schemas/issues'
import type { ComponentBoundsStitchLineSchema, StitchLineCommonConfigSchema } from '../../schemas/stitching'
import { SectionGroup } from '../common/SectionGroup'
import { CornerRadiusSection } from '../component-editors/sections/CornerRadiusSection'
import { StitchLineComponentsSection } from './sections/StitchLineComponentsSection'
import { StitchSidesAndCornersSection } from './sections/StitchSidesAndCornersSection'
import { StitchingSettingsSection } from './sections/StitchingSettingsSection'

export const ComponentBoundsStitchLineEditor: FC = () => {
  const { selectedModelId, models, editableModels, validationIssues, setModel } =
    useEditableModelsContext<ComponentBoundsStitchLineSchema>()

  const value = models[selectedModelId]
  const editable = editableModels[selectedModelId]
  const onChange = setModel[selectedModelId]

  const limitIssues = useStitchLineLimitIssues(value)
  const issues = useCombinedIssues<ComponentBoundsStitchLineSchema>(
    validationIssues[selectedModelId],
    limitIssues as IssuesSchema<ComponentBoundsStitchLineSchema>,
  )
  const resolvedEditable = useResolvedEditableStitchLine<ComponentBoundsStitchLineSchema>(editable)

  const onReset = useCallback(
    (key: keyof StitchLineCommonConfigSchema): void => {
      const updatedEditable = { ...editable }
      delete updatedEditable[key]
      onChange(updatedEditable)
    },
    [editable, onChange],
  )
  const { t } = useTranslation()
  const { activeTab, onTabChange } = useFloatingEditorTab({
    modelId: value.id,
    defaultTab: StitchLineEditorTabs.settings,
    tabs: StitchLineEditorTabs,
  })
  return (
    <Tabs.Root value={activeTab} onValueChange={onTabChange}>
      <Tabs.List alignItems="center" pr="2">
        <Tabs.Trigger value={StitchLineEditorTabs.settings}>{t.project.editors.tabs.stitchLines.settings}</Tabs.Trigger>
        <Tabs.Trigger value={StitchLineEditorTabs.overrides}>
          {t.project.editors.tabs.stitchLines.overrides}
        </Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value={StitchLineEditorTabs.settings} pt={0}>
        <SectionGroup.Root>
          <StitchLineComponentsSection editable={editable} onChange={onChange} />
          <StitchSidesAndCornersSection value={value} editable={editable} issues={issues} onChange={onChange} />
          <CornerRadiusSection<ComponentBoundsStitchLineSchema>
            modelId={editable.id}
            editable={editable}
            issues={issues}
            onChange={onChange}
          />
        </SectionGroup.Root>
      </Tabs.Content>
      <Tabs.Content value={StitchLineEditorTabs.overrides} pt={0}>
        <SectionGroup.Root>
          <StitchingSettingsSection<ComponentBoundsStitchLineSchema>
            modelId={editable.id}
            editable={editable}
            issues={issues}
            onChange={onChange}
            onReset={onReset}
            resolvedEditable={resolvedEditable}
          />
        </SectionGroup.Root>
      </Tabs.Content>
    </Tabs.Root>
  )
}
