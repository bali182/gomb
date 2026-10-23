import type { FC } from 'react'

import { useProject } from '../../hooks/useProject'
import { useSubProject } from '../../hooks/useSubProject'
import { accessors } from '../../utils/accessors'
import { getResolvedStitchLine } from '../../utils/getResolvedStitchLine'
import { isDefined } from '../../utils/isDefined'
import { StitchLine } from './StitchLine'

type TPocketStitchLinesProps = {
  componentId: string
}

export const TPocketStitchLines: FC<TPocketStitchLinesProps> = ({ componentId }) => {
  const { project } = useProject()
  const { subProject, computedSubProject } = useSubProject()
  const accessor = accessors.subProject(subProject)
  const computedStitchLines = computedSubProject.stitchLines[componentId] ?? []

  return (
    <>
      {computedStitchLines.map((computedStitchLine) => {
        const stitchLine = accessor.optional.stitchLine(computedStitchLine.stitchLineId)

        if (!isDefined(stitchLine) || stitchLine.type !== 't-pocket-stitch-line') {
          return null
        }

        const resolvedStitchLine = getResolvedStitchLine(stitchLine, project.stitchingSettings)
        return (
          <StitchLine key={stitchLine.id} computedStitchLine={computedStitchLine} stitchLine={resolvedStitchLine} />
        )
      })}
    </>
  )
}
