import { useCallback, type FC } from 'react'
import { useTranslation } from '../../../hooks/useTranslation'
import type { HasExitComponentSchema } from '../../../schemas/stitching'
import { SectionGroup } from '../../common/SectionGroup'
import { StitchLineComponentCombobox } from '../StitchLineComponentCombobox'

type TPocketStitchLineComponentsSectionProps = {
  stitchLineId: string
  value: HasExitComponentSchema
  onChange: (value: HasExitComponentSchema) => void
}

export const TPocketStitchLineComponentsSection: FC<TPocketStitchLineComponentsSectionProps> = ({
  stitchLineId,
  value,
  onChange,
}) => {
  const { t } = useTranslation()
  const handleChange = useCallback(
    (exitComponentId: string | undefined): void => onChange({ exitComponentId }),
    [onChange],
  )
  return (
    <SectionGroup.Section>
      <SectionGroup.SectionHeader>{t.project.editors.sections.stitchLines.components.title}</SectionGroup.SectionHeader>
      <SectionGroup.SectionRowTitle tooltip={t.project.editors.sections.stitchLines.components.exitComponentId.tooltip}>
        {t.project.editors.sections.stitchLines.components.exitComponentId.label}
      </SectionGroup.SectionRowTitle>
      <SectionGroup.SectionRowEditor>
        <StitchLineComponentCombobox
          stitchLineId={stitchLineId}
          field="exitComponentId"
          componentId={value.exitComponentId}
          onChange={handleChange}
        />
      </SectionGroup.SectionRowEditor>
    </SectionGroup.Section>
  )
}
