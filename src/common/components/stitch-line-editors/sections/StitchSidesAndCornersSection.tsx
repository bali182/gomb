import { useMemo } from 'react'
import { useTranslation } from '../../../hooks/useTranslation'
import { EditableSchema } from '../../../schemas/editable'
import type { IssueSchema, IssuesSchema } from '../../../schemas/issues'
import { ComponentBoundsStitchLineSchema } from '../../../schemas/stitching'
import { getLabeledIssues } from '../../../utils/issueUtils'
import { SectionGroup } from '../../common/SectionGroup'
import { StitchLineSidesAndCorners } from '../StitchLineSidesAndCorners'

type StitchSidesAndCornersSectionProps = {
  editable: EditableSchema<ComponentBoundsStitchLineSchema>
  issues: IssuesSchema<ComponentBoundsStitchLineSchema>
  onChange: (updated: EditableSchema<ComponentBoundsStitchLineSchema>) => void
}

export const StitchSidesAndCornersSection = ({ editable, issues, onChange }: StitchSidesAndCornersSectionProps) => {
  const { t } = useTranslation()
  const stitchSidesAndCornersIssues = useMemo<readonly IssueSchema[]>(
    () =>
      getLabeledIssues<ComponentBoundsStitchLineSchema>(issues, t.project.editors.sections.stitchLines.sidesAndCorners),
    [issues, t],
  )

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
