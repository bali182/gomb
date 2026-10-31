import { type FC } from 'react'
import { StitchLineEditorTabs } from '../../constants/editorTabs'

import { Tabs } from '@chakra-ui/react'
import { useFloatingEditorTab } from '../../hooks/useFloatingEditorTab'
import { useTranslation } from '../../hooks/useTranslation'
import type { EditableSchema } from '../../schemas/editable'
import type { IssuesSchema } from '../../schemas/issues'
import type { ComponentBoundsStitchLineSchema, StitchLineCommonConfigSchema } from '../../schemas/stitching'
import { SectionGroup } from '../common/SectionGroup'
import { CornerRadiusSection } from '../component-editors/sections/CornerRadiusSection'
import { StitchSidesAndCornersSection } from './sections/StitchSidesAndCornersSection'
import { StitchingSettingsSection } from './sections/StitchingSettingsSection'

type ComponentBoundsStitchLineEditorProps = {
  value: ComponentBoundsStitchLineSchema
  editable: EditableSchema<ComponentBoundsStitchLineSchema>
  issues: IssuesSchema<ComponentBoundsStitchLineSchema>
  onChange: (updated: EditableSchema<ComponentBoundsStitchLineSchema>) => void
  onReset: (key: keyof StitchLineCommonConfigSchema) => void
  resolvedEditable: EditableSchema<StitchLineCommonConfigSchema> & EditableSchema<ComponentBoundsStitchLineSchema>
}

export const ComponentBoundsStitchLineEditor: FC<ComponentBoundsStitchLineEditorProps> = ({
  value,
  editable,
  issues,
  onChange,
  onReset,
  resolvedEditable,
}) => {
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
          <StitchSidesAndCornersSection editable={editable} issues={issues} onChange={onChange} />
          <CornerRadiusSection
            modelId={editable.id}
            value={value}
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
