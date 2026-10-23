import { type FC } from 'react'

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

const ComponentBoundsStitchLineTabs = {
  settings: 'settings',
  overrides: 'overrides',
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
    defaultTab: ComponentBoundsStitchLineTabs.settings,
    tabs: ComponentBoundsStitchLineTabs,
  })
  return (
    <Tabs.Root value={activeTab} onValueChange={onTabChange}>
      <Tabs.List alignItems="center" pr="2">
        <Tabs.Trigger value={ComponentBoundsStitchLineTabs.settings}>{t.project.editors.tabs.stitchLines.settings}</Tabs.Trigger>
        <Tabs.Trigger value={ComponentBoundsStitchLineTabs.overrides}>{t.project.editors.tabs.stitchLines.overrides}</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value={ComponentBoundsStitchLineTabs.settings} pt={0}>
        <SectionGroup.Root>
          <StitchSidesAndCornersSection editable={editable} issues={issues} onChange={onChange} />
          <CornerRadiusSection value={value} editable={editable} issues={issues} onChange={onChange} />
        </SectionGroup.Root>
      </Tabs.Content>
      <Tabs.Content value={ComponentBoundsStitchLineTabs.overrides} pt={0}>
        <SectionGroup.Root>
          <StitchingSettingsSection<ComponentBoundsStitchLineSchema>
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
