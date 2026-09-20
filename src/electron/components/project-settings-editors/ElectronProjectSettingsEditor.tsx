import { Tabs } from '@chakra-ui/react'
import type { FC } from 'react'

import { SectionGroup } from '../../../common/components/common/SectionGroup'
import { ColorSettingsSections } from '../../../common/components/project-settings-editors/ColorSettingsSections'
import { ProjectStitchingSection } from '../../../common/components/project-settings-editors/ProjectStitchingSection'
import { useTranslation } from '../../../common/hooks/useTranslation'
import type { EditableSchema } from '../../../common/schemas/editable'
import type { LoadableSchema } from '../../../common/schemas/loadable'
import type { ProjectSchema } from '../../../common/schemas/project'
import type { IssueSchema, ValidationIssuesSchema } from '../../../common/schemas/validation'
import { ElectronProjectBasicSection } from './ElectronProjectBasicSection'

type ElectronProjectSettingsEditorProps = {
  editable: EditableSchema<ProjectSchema>
  filePath: string
  filePathIssue: LoadableSchema<IssueSchema | undefined>
  isFilePathManuallyModified: boolean
  issues: ValidationIssuesSchema<ProjectSchema>
  onChange: (updated: EditableSchema<ProjectSchema>) => void
  onFilePathChange: (filePath: string) => void
  onFilePathReset: () => void
  onFilePickerButtonPressed: () => void
}

export const ElectronProjectSettingsEditor: FC<ElectronProjectSettingsEditorProps> = ({
  editable,
  filePath,
  filePathIssue,
  isFilePathManuallyModified,
  issues,
  onChange,
  onFilePathChange,
  onFilePathReset,
  onFilePickerButtonPressed,
}) => {
  const { t } = useTranslation()

  return (
    <Tabs.Root defaultValue="basic">
      <Tabs.List alignItems="center" pr="2">
        <Tabs.Trigger value="basic">{t.project.editors.tabs.project.basic}</Tabs.Trigger>
        <Tabs.Trigger value="stitching">{t.project.editors.tabs.project.stitching}</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="basic" pt={0}>
        <SectionGroup.Root>
          <ElectronProjectBasicSection
            editable={editable}
            filePath={filePath}
            filePathIssue={filePathIssue}
            isFilePathManuallyModified={isFilePathManuallyModified}
            issues={issues}
            onChange={onChange}
            onFilePathChange={onFilePathChange}
            onFilePathReset={onFilePathReset}
            onFilePickerButtonPressed={onFilePickerButtonPressed}
          />
          <ColorSettingsSections editable={editable} issues={issues} onChange={onChange} />
        </SectionGroup.Root>
      </Tabs.Content>
      <Tabs.Content value="stitching" pt={0}>
        <ProjectStitchingSection editable={editable} issues={issues} onChange={onChange} />
      </Tabs.Content>
    </Tabs.Root>
  )
}
