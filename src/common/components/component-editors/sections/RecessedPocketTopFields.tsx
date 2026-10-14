import { useCallback, type FC } from 'react'

import { useTranslation } from '../../../hooks/useTranslation'
import type { RecessedPocketTopSchema } from '../../../schemas/components'
import type { EditableSchema } from '../../../schemas/editable'
import type { ValidationIssuesSchema } from '../../../schemas/validation'
import { NumberInput } from '../../common/NumberInput'
import { SectionGroup } from '../../common/SectionGroup'

type RecessedPocketTopFieldsProps = {
  editable: EditableSchema<RecessedPocketTopSchema>
  issues: ValidationIssuesSchema<RecessedPocketTopSchema>
  onChange: (updated: EditableSchema<RecessedPocketTopSchema>) => void
}

export const RecessedPocketTopFields: FC<RecessedPocketTopFieldsProps> = ({ editable, issues, onChange }) => {
  const { t } = useTranslation()
  const text = t.project.editors.sections.components.pocketTop
  const handleOuterInsetChange = useCallback(
    (outerInset: string): void => {
      onChange({ ...editable, outerInset })
    },
    [editable, onChange],
  )
  const handleInnerInsetChange = useCallback(
    (innerInset: string): void => {
      onChange({ ...editable, innerInset })
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
      <SectionGroup.SectionRowTitle tooltip={text.outerInset.tooltip}>
        {text.outerInset.label}
      </SectionGroup.SectionRowTitle>
      <SectionGroup.SectionRowEditor issue={issues.outerInset}>
        <NumberInput
          value={editable.outerInset}
          issue={issues.outerInset}
          onChange={handleOuterInsetChange}
          unit="mm"
        />
      </SectionGroup.SectionRowEditor>
      <SectionGroup.SectionRowTitle tooltip={text.innerInset.tooltip}>
        {text.innerInset.label}
      </SectionGroup.SectionRowTitle>
      <SectionGroup.SectionRowEditor issue={issues.innerInset}>
        <NumberInput
          value={editable.innerInset}
          issue={issues.innerInset}
          onChange={handleInnerInsetChange}
          unit="mm"
        />
      </SectionGroup.SectionRowEditor>
      <SectionGroup.SectionRowTitle tooltip={text.depth.tooltip}>{text.depth.label}</SectionGroup.SectionRowTitle>
      <SectionGroup.SectionRowEditor issue={issues.depth}>
        <NumberInput value={editable.depth} issue={issues.depth} onChange={handleDepthChange} unit="mm" />
      </SectionGroup.SectionRowEditor>
      <SectionGroup.SectionRowTitle tooltip={text.outerRadius.tooltip}>
        {text.outerRadius.label}
      </SectionGroup.SectionRowTitle>
      <SectionGroup.SectionRowEditor issue={issues.outerRadius}>
        <NumberInput
          value={editable.outerRadius}
          issue={issues.outerRadius}
          onChange={handleOuterRadiusChange}
          unit="mm"
        />
      </SectionGroup.SectionRowEditor>
      <SectionGroup.SectionRowTitle tooltip={text.innerRadius.tooltip}>
        {text.innerRadius.label}
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
