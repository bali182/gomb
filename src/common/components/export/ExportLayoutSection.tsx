import { useCallback, type ReactNode } from 'react'

import { useTranslation } from '../../hooks/useTranslation'
import type { EditableSchema } from '../../schemas/editable'
import type { ExportSettingsSchema } from '../../schemas/settings'
import type { ValidationIssuesSchema } from '../../schemas/validation'
import { NumberInput } from '../common/NumberInput'
import { SectionGroup } from '../common/SectionGroup'

type ExportLayoutSectionProps = {
  editable: EditableSchema<ExportSettingsSchema>
  issues: ValidationIssuesSchema<ExportSettingsSchema>
  onChange: (updated: EditableSchema<ExportSettingsSchema>) => void
}

export function ExportLayoutSection({ editable, issues, onChange }: ExportLayoutSectionProps): ReactNode {
  const { t } = useTranslation()
  const handleGapChange = useCallback(
    (gap: string): void => {
      onChange({ ...editable, gap })
    },
    [editable, onChange],
  )
  const handlePaddingChange = useCallback(
    (padding: string): void => {
      onChange({ ...editable, padding })
    },
    [editable, onChange],
  )

  return (
    <SectionGroup.Section>
      <SectionGroup.SectionHeader>{t.project.editors.sections.export.layout.title}</SectionGroup.SectionHeader>
      <SectionGroup.SectionRowTitle tooltip={t.project.editors.sections.export.layout.gap.tooltip}>
        {t.project.editors.sections.export.layout.gap.label}
      </SectionGroup.SectionRowTitle>
      <SectionGroup.SectionRowEditor issue={issues.gap}>
        <NumberInput issue={issues.gap} onChange={handleGapChange} unit="mm" value={editable.gap} />
      </SectionGroup.SectionRowEditor>
      <SectionGroup.SectionRowTitle tooltip={t.project.editors.sections.export.layout.padding.tooltip}>
        {t.project.editors.sections.export.layout.padding.label}
      </SectionGroup.SectionRowTitle>
      <SectionGroup.SectionRowEditor issue={issues.padding}>
        <NumberInput issue={issues.padding} onChange={handlePaddingChange} unit="mm" value={editable.padding} />
      </SectionGroup.SectionRowEditor>
    </SectionGroup.Section>
  )
}
