import { Tabs } from '@chakra-ui/react'
import { useCallback, type FC } from 'react'
import { PocketEditorTabs } from '../../constants/editorTabs'
import { useFloatingEditorTab } from '../../hooks/useFloatingEditorTab'
import { useTranslation } from '../../hooks/useTranslation'
import type { PocketClusterSchema, TPocketSchema } from '../../schemas/components'
import type { EditableSchema } from '../../schemas/editable'
import type { IssuesSchema } from '../../schemas/issues'
import { EditorNumberInput } from '../common/EditorNumberInput'
import { SectionGroup } from '../common/SectionGroup'
import { ContentsSection } from './sections/ContentsSection'
import { PocketOpeningSection } from './sections/PocketOpeningSection'
type TPocketEditorProps = {
  component: TPocketSchema
  editable: EditableSchema<TPocketSchema>
  issues: IssuesSchema<TPocketSchema>
  parent: PocketClusterSchema
  onChange: (value: EditableSchema<TPocketSchema>) => void
}

export const TPocketEditor: FC<TPocketEditorProps> = ({ component, editable, issues, parent, onChange }) => {
  const { t } = useTranslation()
  const { activeTab, onTabChange } = useFloatingEditorTab({
    modelId: component.id,
    defaultTab: PocketEditorTabs.layout,
    tabs: PocketEditorTabs,
  })
  const handleOpeningIdChange = useCallback(
    (openingId: string): void => onChange({ ...editable, openingId }),
    [editable, onChange],
  )
  const handleTabWidthChange = useCallback(
    (tPocketTabWidth: string): void => onChange({ ...editable, tPocketTabWidth }),
    [editable, onChange],
  )
  const handleTaperChange = useCallback(
    (tPocketTaper: string): void => onChange({ ...editable, tPocketTaper }),
    [editable, onChange],
  )
  return (
    <Tabs.Root value={activeTab} onValueChange={onTabChange}>
      <Tabs.List alignItems="center" pr="2">
        <Tabs.Trigger value={PocketEditorTabs.layout}>{t.project.editors.tabs.components.layout}</Tabs.Trigger>
        <Tabs.Trigger value={PocketEditorTabs.contents}>{t.project.editors.tabs.components.contents}</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value={PocketEditorTabs.layout} pt={0}>
        <SectionGroup.Root>
          <SectionGroup.Section>
            <SectionGroup.SectionHeader>
              {t.project.editors.sections.components.tPocket.title}
            </SectionGroup.SectionHeader>
            <SectionGroup.SectionRowTitle
              tooltip={t.project.editors.sections.components.tPocket.tPocketTabWidth.tooltip}
            >
              {t.project.editors.sections.components.tPocket.tPocketTabWidth.label}
            </SectionGroup.SectionRowTitle>
            <SectionGroup.SectionRowEditor issue={issues.tPocketTabWidth}>
              <EditorNumberInput
                modelId={editable.id}
                field="tPocketTabWidth"
                unit="mm"
                value={editable.tPocketTabWidth}
                issue={issues.tPocketTabWidth}
                onChange={handleTabWidthChange}
              />
            </SectionGroup.SectionRowEditor>
            <SectionGroup.SectionRowTitle tooltip={t.project.editors.sections.components.tPocket.tPocketTaper.tooltip}>
              {t.project.editors.sections.components.tPocket.tPocketTaper.label}
            </SectionGroup.SectionRowTitle>
            <SectionGroup.SectionRowEditor issue={issues.tPocketTaper}>
              <EditorNumberInput
                modelId={editable.id}
                field="tPocketTaper"
                unit="mm"
                value={editable.tPocketTaper}
                issue={issues.tPocketTaper}
                onChange={handleTaperChange}
              />
            </SectionGroup.SectionRowEditor>
          </SectionGroup.Section>
          <PocketOpeningSection
            pocket={component}
            cluster={parent}
            openingId={editable.openingId}
            onOpeningIdChange={handleOpeningIdChange}
          />
        </SectionGroup.Root>
      </Tabs.Content>
      <Tabs.Content value={PocketEditorTabs.contents} pt={0}>
        <SectionGroup.Root>
          <ContentsSection<TPocketSchema>
            modelId={editable.id}
            editable={editable}
            issues={issues}
            onChange={onChange}
          />
        </SectionGroup.Root>
      </Tabs.Content>
    </Tabs.Root>
  )
}
