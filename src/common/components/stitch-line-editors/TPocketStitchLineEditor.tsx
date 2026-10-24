import { type FC } from 'react'

import { Tabs } from '@chakra-ui/react'
import { useFloatingEditorTab } from '../../hooks/useFloatingEditorTab'
import { useTranslation } from '../../hooks/useTranslation'
import type { EditableSchema } from '../../schemas/editable'
import type { IssuesSchema } from '../../schemas/issues'
import type { StitchLineCommonConfigSchema, TPocketStitchLineSchema } from '../../schemas/stitching'
import { SectionGroup } from '../common/SectionGroup'
import { PocketStitchingSection } from './sections/PocketStitchingSection'
import { StitchingSettingsSection } from './sections/StitchingSettingsSection'

type TPocketStitchLineEditorProps = {
  editable: EditableSchema<TPocketStitchLineSchema>
  issues: IssuesSchema<TPocketStitchLineSchema>
  onChange: (updated: EditableSchema<TPocketStitchLineSchema>) => void
  onReset: (key: keyof StitchLineCommonConfigSchema) => void
  resolvedEditable: EditableSchema<StitchLineCommonConfigSchema> & EditableSchema<TPocketStitchLineSchema>
}

const TPocketStitchLineTabs = {
  settings: 'settings',
  overrides: 'overrides',
}

export const TPocketStitchLineEditor: FC<TPocketStitchLineEditorProps> = ({
  editable,
  issues,
  onChange,
  onReset,
  resolvedEditable,
}) => {
  const { t } = useTranslation()
  const { activeTab, onTabChange } = useFloatingEditorTab({
    modelId: editable.id,
    defaultTab: TPocketStitchLineTabs.settings,
    tabs: TPocketStitchLineTabs,
  })
  return (
    <Tabs.Root value={activeTab} onValueChange={onTabChange}>
      <Tabs.List alignItems="center" pr="2">
        <Tabs.Trigger value={TPocketStitchLineTabs.settings}>
          {t.project.editors.tabs.stitchLines.settings}
        </Tabs.Trigger>
        <Tabs.Trigger value={TPocketStitchLineTabs.overrides}>
          {t.project.editors.tabs.stitchLines.overrides}
        </Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value={TPocketStitchLineTabs.settings} pt={0}>
        <SectionGroup.Root>
          <PocketStitchingSection editable={editable} issues={issues} onChange={onChange} />
        </SectionGroup.Root>
      </Tabs.Content>
      <Tabs.Content value={TPocketStitchLineTabs.overrides} pt={0}>
        <SectionGroup.Root>
          <StitchingSettingsSection<TPocketStitchLineSchema>
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
