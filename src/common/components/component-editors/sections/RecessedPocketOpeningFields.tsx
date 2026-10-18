import { useCallback, type FC } from 'react'

import { useTranslation } from '../../../hooks/useTranslation'
import type { RecessedPocketOpeningSchema } from '../../../schemas/components'
import type { EditableSchema } from '../../../schemas/editable'
import type { ValidationIssuesSchema } from '../../../schemas/validation'
import { NumberInput } from '../../common/NumberInput'
import { SectionGroup } from '../../common/SectionGroup'

type RecessedPocketOpeningFieldsProps = {
  editable: EditableSchema<RecessedPocketOpeningSchema>
  issues: ValidationIssuesSchema<RecessedPocketOpeningSchema>
  onChange: (updated: EditableSchema<RecessedPocketOpeningSchema>) => void
}

export const RecessedPocketOpeningFields: FC<RecessedPocketOpeningFieldsProps> = ({ editable, issues, onChange }) => {
  const { t } = useTranslation()
  const handleOuterInsetChange = useCallback(
    (outerInset: string): void => {
      onChange({ ...editable, outerInset })
    },
    [editable, onChange],
  )
  const handleInnerOffsetChange = useCallback(
    (innerOffset: string): void => {
      onChange({ ...editable, innerOffset })
    },
    [editable, onChange],
  )
  const handleDepthChange = useCallback(
    (depth: string): void => {
      onChange({ ...editable, depth })
    },
    [editable, onChange],
  )
  const handleOuterRadiusChange = useCallback(
    (outerRadius: string): void => {
      onChange({ ...editable, outerRadius })
    },
    [editable, onChange],
  )
  const handleInnerRadiusChange = useCallback(
    (innerRadius: string): void => {
      onChange({ ...editable, innerRadius })
    },
    [editable, onChange],
  )

  return (
    <>
      <SectionGroup.SectionRowTitle tooltip={t.project.editors.sections.components.pocketOpening.outerInset.tooltip}>
        {t.project.editors.sections.components.pocketOpening.outerInset.label}
      </SectionGroup.SectionRowTitle>
      <SectionGroup.SectionRowEditor issue={issues.outerInset}>
        <NumberInput
          value={editable.outerInset}
          issue={issues.outerInset}
          onChange={handleOuterInsetChange}
          unit="mm"
        />
      </SectionGroup.SectionRowEditor>
      <SectionGroup.SectionRowTitle tooltip={t.project.editors.sections.components.pocketOpening.innerOffset.tooltip}>
        {t.project.editors.sections.components.pocketOpening.innerOffset.label}
      </SectionGroup.SectionRowTitle>
      <SectionGroup.SectionRowEditor issue={issues.innerOffset}>
        <NumberInput
          value={editable.innerOffset}
          issue={issues.innerOffset}
          onChange={handleInnerOffsetChange}
          unit="mm"
        />
      </SectionGroup.SectionRowEditor>
      <SectionGroup.SectionRowTitle tooltip={t.project.editors.sections.components.pocketOpening.depth.tooltip}>
        {t.project.editors.sections.components.pocketOpening.depth.label}
      </SectionGroup.SectionRowTitle>
      <SectionGroup.SectionRowEditor issue={issues.depth}>
        <NumberInput value={editable.depth} issue={issues.depth} onChange={handleDepthChange} unit="mm" />
      </SectionGroup.SectionRowEditor>
      <SectionGroup.SectionRowTitle tooltip={t.project.editors.sections.components.pocketOpening.outerRadius.tooltip}>
        {t.project.editors.sections.components.pocketOpening.outerRadius.label}
      </SectionGroup.SectionRowTitle>
      <SectionGroup.SectionRowEditor issue={issues.outerRadius}>
        <NumberInput
          value={editable.outerRadius}
          issue={issues.outerRadius}
          onChange={handleOuterRadiusChange}
          unit="mm"
        />
      </SectionGroup.SectionRowEditor>
      <SectionGroup.SectionRowTitle tooltip={t.project.editors.sections.components.pocketOpening.innerRadius.tooltip}>
        {t.project.editors.sections.components.pocketOpening.innerRadius.label}
      </SectionGroup.SectionRowTitle>
      <SectionGroup.SectionRowEditor issue={issues.innerRadius}>
        <NumberInput
          value={editable.innerRadius}
          issue={issues.innerRadius}
          onChange={handleInnerRadiusChange}
          unit="mm"
        />
      </SectionGroup.SectionRowEditor>
    </>
  )
}
