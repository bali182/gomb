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
import type {
  HasExitComponentSchema,
  StitchLineCommonConfigSchema,
  TPocketStitchLineSchema,
} from '../../schemas/stitching'
import { SectionGroup } from '../common/SectionGroup'
import { PocketStitchingSection } from './sections/PocketStitchingSection'
import { StitchingSettingsSection } from './sections/StitchingSettingsSection'
import { TPocketStitchLineComponentsSection } from './sections/TPocketStitchLineComponentsSection'

export const TPocketStitchLineEditor: FC = () => {
  const { selectedModelId, models, editableModels, validationIssues, setModel } =
    useEditableModelsContext<TPocketStitchLineSchema>()

  const stitchLine = models[selectedModelId]
  const editable = editableModels[selectedModelId]
  const onChange = setModel[selectedModelId]
  const limitIssues = useStitchLineLimitIssues(stitchLine)

  const issues = useCombinedIssues<TPocketStitchLineSchema>(
    validationIssues[selectedModelId],
    limitIssues as IssuesSchema<TPocketStitchLineSchema>,
  )

  const resolvedEditable = useResolvedEditableStitchLine<TPocketStitchLineSchema>(editable)

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
    modelId: editable.id,
    defaultTab: StitchLineEditorTabs.settings,
    tabs: StitchLineEditorTabs,
  })
  const handleComponentsChange = useCallback(
    (value: HasExitComponentSchema): void => onChange({ ...editable, ...value }),
    [editable, onChange],
  )
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
          <TPocketStitchLineComponentsSection
            stitchLineId={editable.id}
            value={editable}
            onChange={handleComponentsChange}
          />
          <PocketStitchingSection editable={editable} issues={issues} onChange={onChange} />
        </SectionGroup.Root>
      </Tabs.Content>
      <Tabs.Content value={StitchLineEditorTabs.overrides} pt={0}>
        <SectionGroup.Root>
          <StitchingSettingsSection<TPocketStitchLineSchema>
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
