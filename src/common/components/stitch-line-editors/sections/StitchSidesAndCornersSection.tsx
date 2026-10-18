import { useMemo } from 'react'
import { useTranslation } from '../../../hooks/useTranslation'
import { EditableSchema } from '../../../schemas/editable'
import type { IssueSchema, IssuesSchema } from '../../../schemas/issues'
import { ComponentBoundsStitchLineSchema } from '../../../schemas/stitching'
import { isDefined } from '../../../utils/isDefined'
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
      [
        issues.top,
        issues.right,
        issues.bottom,
        issues.left,
        issues.topLeftCorner,
        issues.topRightCorner,
        issues.bottomRightCorner,
        issues.bottomLeftCorner,
        issues.stitchDisconnectedTopLeftCorner,
        issues.stitchDisconnectedTopRightCorner,
        issues.stitchDisconnectedBottomRightCorner,
        issues.stitchDisconnectedBottomLeftCorner,
        issues.topStitchDirection,
        issues.rightStitchDirection,
        issues.bottomStitchDirection,
        issues.leftStitchDirection,
        issues.topStartOffset,
        issues.topEndOffset,
        issues.rightStartOffset,
        issues.rightEndOffset,
        issues.bottomStartOffset,
        issues.bottomEndOffset,
        issues.leftStartOffset,
        issues.leftEndOffset,
      ].filter(isDefined),
    [issues],
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
