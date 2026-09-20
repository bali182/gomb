import { Input } from '@chakra-ui/react'
import { useCallback, type ChangeEvent, type FC } from 'react'

import { SectionGroup } from '../../../common/components/common/SectionGroup'
import { useTranslation } from '../../../common/hooks/useTranslation'
import type { EditableSchema } from '../../../common/schemas/editable'
import type { ProjectSchema } from '../../../common/schemas/project'
import type { ValidationIssuesSchema } from '../../../common/schemas/validation'
import { isDefined } from '../../../common/utils/isDefined'

type WebProjectBasicSectionProps = {
  editable: EditableSchema<ProjectSchema>
  issues: ValidationIssuesSchema<ProjectSchema>
  onChange: (updated: EditableSchema<ProjectSchema>) => void
}

export const WebProjectBasicSection: FC<WebProjectBasicSectionProps> = ({ editable, issues, onChange }) => {
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
      <SectionGroup.SectionRowTitle>{t.project.editors.sections.project.basic.name.label}</SectionGroup.SectionRowTitle>
      <SectionGroup.SectionRowEditor issue={issues.name}>
        <Input aria-invalid={hasNameError} autoFocus onChange={handleNameChange} size="xs" value={editable.name} />
      </SectionGroup.SectionRowEditor>
    </SectionGroup.Section>
  )
}
