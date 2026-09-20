import { useCallback, type ReactNode } from 'react'

import { useTranslation2 } from '../../hooks/useTranslation2'
import type { EditableSchema } from '../../schemas/editable'
import type { BaseExportSettingsSchema } from '../../schemas/settings'
import type { ValidationIssuesSchema } from '../../schemas/validation'
import { NumberInput } from '../common/NumberInput'
import { SectionGroup } from '../common/SectionGroup'

type ExportLayoutSectionProps<T extends BaseExportSettingsSchema> = {
  editable: EditableSchema<T>
  issues: ValidationIssuesSchema<BaseExportSettingsSchema>
  onChange: (updated: EditableSchema<T>) => void
}

export function ExportLayoutSection<T extends BaseExportSettingsSchema>({
  editable,
  issues,
  onChange,
}: ExportLayoutSectionProps<T>): ReactNode {
  const { t } = useTranslation2()
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
      <SectionGroup.SectionRowTitle>{t.project.editors.sections.export.layout.gap.label}</SectionGroup.SectionRowTitle>
      <SectionGroup.SectionRowEditor issue={issues.gap}>
        <NumberInput issue={issues.gap} onChange={handleGapChange} unit="mm" value={editable.gap} />
      </SectionGroup.SectionRowEditor>
      <SectionGroup.SectionRowTitle>
        {t.project.editors.sections.export.layout.padding.label}
      </SectionGroup.SectionRowTitle>
      <SectionGroup.SectionRowEditor issue={issues.padding}>
        <NumberInput issue={issues.padding} onChange={handlePaddingChange} unit="mm" value={editable.padding} />
      </SectionGroup.SectionRowEditor>
    </SectionGroup.Section>
  )
}
