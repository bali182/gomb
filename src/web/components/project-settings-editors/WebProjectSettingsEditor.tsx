import { Tabs } from '@chakra-ui/react'
import type { FC } from 'react'

import { SectionGroup } from '../../../common/components/common/SectionGroup'
import { ColorSettingsSections } from '../../../common/components/project-settings-editors/ColorSettingsSections'
import { ProjectStitchingSection } from '../../../common/components/project-settings-editors/ProjectStitchingSection'
import { useTranslation2 } from '../../../common/hooks/useTranslation2'
import type { EditableSchema } from '../../../common/schemas/editable'
import type { ProjectSchema } from '../../../common/schemas/project'
import type { ValidationIssuesSchema } from '../../../common/schemas/validation'
import { WebProjectBasicSection } from './WebProjectBasicSection'

type WebProjectSettingsEditorProps = {
  editable: EditableSchema<ProjectSchema>
  issues: ValidationIssuesSchema<ProjectSchema>
  onChange: (updated: EditableSchema<ProjectSchema>) => void
}

export const WebProjectSettingsEditor: FC<WebProjectSettingsEditorProps> = ({ editable, issues, onChange }) => {
  const { t } = useTranslation2()

  return (
    <Tabs.Root defaultValue="basic">
      <Tabs.List alignItems="center" pr="2">
        <Tabs.Trigger value="basic">{t.project.editors.tabs.project.basic}</Tabs.Trigger>
        <Tabs.Trigger value="stitching">{t.project.editors.tabs.project.stitching}</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="basic" pt={0}>
        <SectionGroup.Root>
          <WebProjectBasicSection editable={editable} issues={issues} onChange={onChange} />
          <ColorSettingsSections editable={editable} issues={issues} onChange={onChange} />
        </SectionGroup.Root>
      </Tabs.Content>
      <Tabs.Content value="stitching" pt={0}>
        <ProjectStitchingSection editable={editable} issues={issues} onChange={onChange} />
      </Tabs.Content>
    </Tabs.Root>
  )
}
