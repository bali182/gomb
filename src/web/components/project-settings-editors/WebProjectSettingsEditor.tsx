import { Tabs } from '@chakra-ui/react'
import type { FC } from 'react'
import { ProjectSettingsEditorTabs } from '../../../common/constants/editorTabs'

import { SectionGroup } from '../../../common/components/common/SectionGroup'
import { ColorSettingsSections } from '../../../common/components/project-settings-editors/ColorSettingsSections'
import { ProjectStitchingSection } from '../../../common/components/project-settings-editors/ProjectStitchingSection'
import { useTranslation } from '../../../common/hooks/useTranslation'
import type { EditableSchema } from '../../../common/schemas/editable'
import type { IssuesSchema } from '../../../common/schemas/issues'
import type { ProjectSchema } from '../../../common/schemas/project'
import { WebProjectBasicSection } from './WebProjectBasicSection'

type WebProjectSettingsEditorProps = {
  editable: EditableSchema<ProjectSchema>
  issues: IssuesSchema<ProjectSchema>
  onChange: (updated: EditableSchema<ProjectSchema>) => void
}

export const WebProjectSettingsEditor: FC<WebProjectSettingsEditorProps> = ({ editable, issues, onChange }) => {
  const { t } = useTranslation()

  return (
    <Tabs.Root defaultValue={ProjectSettingsEditorTabs.basic}>
      <Tabs.List alignItems="center" pr="2">
        <Tabs.Trigger value={ProjectSettingsEditorTabs.basic}>{t.project.editors.tabs.project.basic}</Tabs.Trigger>
        <Tabs.Trigger value={ProjectSettingsEditorTabs.stitching}>
          {t.project.editors.tabs.project.stitching}
        </Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value={ProjectSettingsEditorTabs.basic} pt={0}>
        <SectionGroup.Root>
          <WebProjectBasicSection editable={editable} issues={issues} onChange={onChange} />
          <ColorSettingsSections editable={editable} issues={issues} onChange={onChange} />
        </SectionGroup.Root>
      </Tabs.Content>
      <Tabs.Content value={ProjectSettingsEditorTabs.stitching} pt={0}>
        <ProjectStitchingSection editable={editable} issues={issues} onChange={onChange} />
      </Tabs.Content>
    </Tabs.Root>
  )
}
