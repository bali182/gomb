import { useCallback, type FC } from 'react'
import { useTranslation } from '../../../hooks/useTranslation'
import type { EditableSchema } from '../../../schemas/editable'
import type { ComponentBoundsStitchLineSchema } from '../../../schemas/stitching'
import { SectionGroup } from '../../common/SectionGroup'
import { StitchLineComponentCombobox } from '../StitchLineComponentCombobox'

type StitchLineComponentsSectionProps = {
  editable: EditableSchema<ComponentBoundsStitchLineSchema>
  onChange: (value: EditableSchema<ComponentBoundsStitchLineSchema>) => void
}

export const StitchLineComponentsSection: FC<StitchLineComponentsSectionProps> = ({ editable, onChange }) => {
  const { t } = useTranslation()
  const handleEntryChange = useCallback(
    (entryComponentId: string | undefined): void => onChange({ ...editable, entryComponentId }),
    [editable, onChange],
  )
  const handleExitChange = useCallback(
    (exitComponentId: string | undefined): void => onChange({ ...editable, exitComponentId }),
    [editable, onChange],
  )
  return (
    <SectionGroup.Section>
      <SectionGroup.SectionHeader>{t.project.editors.sections.stitchLines.components.title}</SectionGroup.SectionHeader>
      <SectionGroup.SectionRowTitle
        tooltip={t.project.editors.sections.stitchLines.components.entryComponentId.tooltip}
      >
        {t.project.editors.sections.stitchLines.components.entryComponentId.label}
      </SectionGroup.SectionRowTitle>
      <SectionGroup.SectionRowEditor>
        <StitchLineComponentCombobox
          stitchLineId={editable.id}
          field="entryComponentId"
          componentId={editable.entryComponentId}
          onChange={handleEntryChange}
        />
      </SectionGroup.SectionRowEditor>
      <SectionGroup.SectionRowTitle tooltip={t.project.editors.sections.stitchLines.components.exitComponentId.tooltip}>
        {t.project.editors.sections.stitchLines.components.exitComponentId.label}
      </SectionGroup.SectionRowTitle>
      <SectionGroup.SectionRowEditor>
        <StitchLineComponentCombobox
          stitchLineId={editable.id}
          field="exitComponentId"
          componentId={editable.exitComponentId}
          onChange={handleExitChange}
        />
      </SectionGroup.SectionRowEditor>
    </SectionGroup.Section>
  )
}
