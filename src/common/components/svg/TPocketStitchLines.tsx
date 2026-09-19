import type { FC } from 'react'

import { useProject } from '../../hooks/useProject'
import { useSubProject } from '../../hooks/useSubProject'
import { accessors } from '../../utils/accessors'
import { getResolvedStitchLine } from '../../utils/getResolvedStitchLine'
import { isDefined } from '../../utils/isDefined'
import { StitchLineRoute } from './StitchLineRoute'

type TPocketStitchLinesProps = {
  componentId: string
  pocketIndex: number
}

export const TPocketStitchLines: FC<TPocketStitchLinesProps> = ({ componentId, pocketIndex }) => {
  const { project } = useProject()
  const { subProject, computedSubProject } = useSubProject()
  const accessor = accessors.subProject(subProject)
  const computedStitchLines = computedSubProject.stitchLines[componentId] ?? []

  return (
    <>
      {computedStitchLines.map((computedStitchLine) => {
        const stitchLine = accessor.optional.stitchLine(computedStitchLine.stitchLineId)

        if (!isDefined(stitchLine) || stitchLine.type !== 'pocket-cluster-stitch-line') {
          return null
        }

        const route = computedStitchLine.routes[pocketIndex]

        if (!isDefined(route)) {
          return null
        }

        const resolvedStitchLine = getResolvedStitchLine(stitchLine, project.stitchingSettings)

        return <StitchLineRoute key={stitchLine.id} route={route} stitchLine={resolvedStitchLine} />
      })}
    </>
  )
}
