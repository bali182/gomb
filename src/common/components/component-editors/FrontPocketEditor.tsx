import { Tabs } from '@chakra-ui/react'
import { useCallback, useMemo, type FC } from 'react'
import { PocketEditorTabs } from '../../constants/editorTabs'
import { useFloatingEditorTab } from '../../hooks/useFloatingEditorTab'
import { useTranslation } from '../../hooks/useTranslation'
import type { HasCornerRadiusValuesSchema } from '../../schemas/common'
import type { FrontPocketSchema, PocketClusterSchema } from '../../schemas/components'
import type { EditableSchema } from '../../schemas/editable'
import type { IssuesSchema } from '../../schemas/issues'
import { SectionGroup } from '../common/SectionGroup'
import { ContentsSection } from './sections/ContentsSection'
import { CornerRadiusSection } from './sections/CornerRadiusSection'
import { LayoutSection } from './sections/LayoutSection'
import { PocketOpeningSection } from './sections/PocketOpeningSection'
type FrontPocketEditorProps = {
  component: FrontPocketSchema
  editable: EditableSchema<FrontPocketSchema>
  issues: IssuesSchema<FrontPocketSchema>
  parent: PocketClusterSchema
  onChange: (value: EditableSchema<FrontPocketSchema>) => void
}

export const FrontPocketEditor: FC<FrontPocketEditorProps> = ({ component, editable, issues, parent, onChange }) => {
  const { activeTab, onTabChange } = useFloatingEditorTab({
    modelId: component.id,
    defaultTab: PocketEditorTabs.layout,
    tabs: PocketEditorTabs,
  })
  const { t } = useTranslation()
  const handleOpeningIdChange = useCallback(
    (openingId: string): void => onChange({ ...editable, openingId }),
    [editable, onChange],
  )
  const disabledFields = useMemo<readonly (keyof HasCornerRadiusValuesSchema)[]>(() => {
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
          <CornerRadiusSection
            modelId={editable.id}
            value={component}
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
          <PocketOpeningSection openingId={editable.openingId} onOpeningIdChange={handleOpeningIdChange} />
        </SectionGroup.Root>
      </Tabs.Content>
      <Tabs.Content value={PocketEditorTabs.contents} pt={0}>
        <SectionGroup.Root>
          <ContentsSection<FrontPocketSchema>
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
