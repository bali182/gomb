import { useMemo } from 'react'
import { useTranslation } from '../../../hooks/useTranslation'
import { EditableSchema } from '../../../schemas/editable'
import { ComponentBoundsStitchLineSchema } from '../../../schemas/stitching'
import { ValidationIssuesSchema } from '../../../schemas/validation'
import { SectionGroup } from '../../common/SectionGroup'
import { StitchLineSidesAndCorners } from '../StitchLineSidesAndCorners'

type StitchSidesAndCornersSectionProps = {
  editable: EditableSchema<ComponentBoundsStitchLineSchema>
  issues: ValidationIssuesSchema<ComponentBoundsStitchLineSchema>
  onChange: (updated: EditableSchema<ComponentBoundsStitchLineSchema>) => void
}

export const StitchSidesAndCornersSection = ({ editable, issues, onChange }: StitchSidesAndCornersSectionProps) => {
  const { t } = useTranslation()
  const stitchSidesAndCornersIssues = useMemo(() => Object.values(issues), [issues])

  return (
    <SectionGroup.Section>
      <SectionGroup.SectionHeader>
        {t.project.editors.sections.stitchLines.sidesAndCorners.title}
      </SectionGroup.SectionHeader>
      <SectionGroup.SectionFullWidthContent issue={stitchSidesAndCornersIssues}>
        <StitchLineSidesAndCorners editable={editable} issues={issues} onChange={onChange} />
      </SectionGroup.SectionFullWidthContent>
    </SectionGroup.Section>
  )
}
