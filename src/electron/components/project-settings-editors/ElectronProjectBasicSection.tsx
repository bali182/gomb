import { useCallback, type ChangeEvent, type FC } from 'react'
import { EditorTextInput } from '../../../common/components/common/EditorTextInput'

import { SectionGroup } from '../../../common/components/common/SectionGroup'
import { useTranslation } from '../../../common/hooks/useTranslation'
import { Loadable } from '../../../common/loadable'
import type { EditableSchema } from '../../../common/schemas/editable'
import type { IssueSchema, IssuesSchema } from '../../../common/schemas/issues'
import type { LoadableSchema } from '../../../common/schemas/loadable'
import type { ProjectSchema } from '../../../common/schemas/project'
import { isDefined } from '../../../common/utils/isDefined'
import { ElectronFilePicker } from './ElectronFilePicker'

type ElectronProjectBasicSectionProps = {
  editable: EditableSchema<ProjectSchema>
  filePath: string
  filePathIssue: LoadableSchema<IssueSchema | undefined>
  isFilePathManuallyModified: boolean
  issues: IssuesSchema<ProjectSchema>
  onChange: (updated: EditableSchema<ProjectSchema>) => void
  onFilePathChange: (filePath: string) => void
  onFilePathReset: () => void
  onFilePickerButtonPressed: () => void
}

export const ElectronProjectBasicSection: FC<ElectronProjectBasicSectionProps> = ({
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
  const handleNameChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>): void => {
      onChange({ ...editable, name: event.target.value })
    },
    [editable, onChange],
  )

  const hasNameError = isDefined(issues.name)

  return (
    <SectionGroup.Section>
      <SectionGroup.SectionHeader>{t.project.editors.sections.project.basic.title}</SectionGroup.SectionHeader>
      <SectionGroup.SectionRowTitle tooltip={t.project.editors.sections.project.basic.name.tooltip}>
        {t.project.editors.sections.project.basic.name.label}
      </SectionGroup.SectionRowTitle>
      <SectionGroup.SectionRowEditor issue={issues.name}>
        <EditorTextInput
          modelId={editable.id}
          field="name"
          aria-invalid={hasNameError}
          autoFocus
          onChange={handleNameChange}
          size="xs"
          value={editable.name}
        />
      </SectionGroup.SectionRowEditor>
      <SectionGroup.SectionRowTitle tooltip={t.project.editors.sections.project.basic.filePath.tooltip}>
        {t.project.editors.sections.project.basic.filePath.label}
      </SectionGroup.SectionRowTitle>
      <SectionGroup.SectionRowEditor issue={Loadable.get(filePathIssue)}>
        <ElectronFilePicker
          isManuallyModified={isFilePathManuallyModified}
          onChange={onFilePathChange}
          onFilePickerButtonPressed={onFilePickerButtonPressed}
          onReset={onFilePathReset}
          value={filePath}
        />
      </SectionGroup.SectionRowEditor>
    </SectionGroup.Section>
  )
}
