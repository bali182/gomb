import type { FC } from 'react'

import { useProject } from '../../hooks/useProject'
import { useSubProject } from '../../hooks/useSubProject'
import { accessors } from '../../utils/accessors'
import { getResolvedStitchLine } from '../../utils/getResolvedStitchLine'
import { isDefined } from '../../utils/isDefined'
import { StitchLine } from './StitchLine'

type StitchLinesProps = {
  componentId: string
}

export const StitchLines: FC<StitchLinesProps> = ({ componentId }) => {
  const { project } = useProject()
  const { subProject, computedSubProject } = useSubProject()
  const accessor = accessors.subProject(subProject)
  const computedStitchLines = computedSubProject.stitchLines[componentId] ?? []

  return (
    <>
      {computedStitchLines.map((computedStitchLine) => {
        const stitchLine = accessor.optional.stitchLine(computedStitchLine.stitchLineId)

        if (!isDefined(stitchLine) || stitchLine.type !== 'component-bounds-stitch-line') {
          return null
        }

        const resolvedStitchLine = getResolvedStitchLine(stitchLine, project.stitchingSettings)

        return (
          <StitchLine computedStitchLine={computedStitchLine} key={stitchLine.id} stitchLine={resolvedStitchLine} />
        )
      })}
    </>
  )
}
