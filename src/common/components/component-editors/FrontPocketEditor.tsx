import { Tabs } from '@chakra-ui/react'
import { useCallback, useMemo, type FC } from 'react'
import { useFloatingEditorTab } from '../../hooks/useFloatingEditorTab'
import { useTranslation } from '../../hooks/useTranslation'
import type { HasCornerRadiusValuesSchema } from '../../schemas/common'
import type { FrontPocketSchema, PocketClusterSchema, PocketOpeningSchema } from '../../schemas/components'
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
const FrontPocketTabs = {
  layout: 'layout',
  contents: 'contents',
}

export const FrontPocketEditor: FC<FrontPocketEditorProps> = ({ component, editable, issues, parent, onChange }) => {
  const { activeTab, onTabChange } = useFloatingEditorTab({
    modelId: component.id,
    defaultTab: FrontPocketTabs.layout,
    tabs: FrontPocketTabs,
  })
  const { t } = useTranslation()
  const handleOpeningChange = useCallback(
    (opening: EditableSchema<PocketOpeningSchema>): void => onChange({ ...editable, opening }),
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
        <Tabs.Trigger value={FrontPocketTabs.layout}>{t.project.editors.tabs.components.layout}</Tabs.Trigger>
        <Tabs.Trigger value={FrontPocketTabs.contents}>{t.project.editors.tabs.components.contents}</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value={FrontPocketTabs.layout} pt={0}>
        <SectionGroup.Root>
          <CornerRadiusSection
            value={component}
            editable={editable}
            issues={issues}
            onChange={onChange}
            disabledFields={disabledFields}
          />
          <LayoutSection component={component} editable={editable} issues={issues} onChange={onChange} />
          <PocketOpeningSection
            cluster={parent}
            editable={editable.opening}
            issues={issues.opening}
            onChange={handleOpeningChange}
          />
        </SectionGroup.Root>
      </Tabs.Content>
      <Tabs.Content value={FrontPocketTabs.contents} pt={0}>
        <SectionGroup.Root>
          <ContentsSection<FrontPocketSchema> editable={editable} issues={issues} onChange={onChange} />
        </SectionGroup.Root>
      </Tabs.Content>
    </Tabs.Root>
  )
}
