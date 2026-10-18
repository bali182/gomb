import { useCallback, type FC } from 'react'

import type { EditableSchema } from '../../schemas/editable'
import type { IssuesSchema } from '../../schemas/issues'
import type { ProjectSchema } from '../../schemas/project'
import type { StitchLineCommonConfigSchema } from '../../schemas/stitching'
import { noIssues } from '../../utils/issueUtils'
import { SectionGroup } from '../common/SectionGroup'
import { StitchingSettingsSection } from '../stitch-line-editors/sections/StitchingSettingsSection'

type ProjectStitchingSectionProps = {
  editable: EditableSchema<ProjectSchema>
  issues: IssuesSchema<ProjectSchema>
  onChange: (updated: EditableSchema<ProjectSchema>) => void
}

export const ProjectStitchingSection: FC<ProjectStitchingSectionProps> = ({ editable, issues, onChange }) => {
  const handleStitchingSettingsChange = useCallback(
    (stitchingSettings: EditableSchema<StitchLineCommonConfigSchema>): void => {
      onChange({ ...editable, stitchingSettings })
    },
    [editable, onChange],
  )

  return (
    <SectionGroup.Root>
      <StitchingSettingsSection<StitchLineCommonConfigSchema>
        editable={editable.stitchingSettings}
        issues={issues.stitchingSettings ?? noIssues<StitchLineCommonConfigSchema>()}
        onChange={handleStitchingSettingsChange}
        resolvedEditable={editable.stitchingSettings}
      />
    </SectionGroup.Root>
  )
}
