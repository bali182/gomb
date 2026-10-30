import { useMemo, type FC } from 'react'
import { narrowers } from '../../utils/narrowers'

import { useProject } from '../../hooks/useProject'
import { useSubProject } from '../../hooks/useSubProject'
import type { ComputedStitchRouteSchema } from '../../schemas/computed'
import type { ResolvedStitchLineSchema } from '../../schemas/stitching'
import { accessors } from '../../utils/accessors'
import { getResolvedStitchLine } from '../../utils/getResolvedStitchLine'
import { isDefined } from '../../utils/isDefined'
import { StitchLine } from './StitchLine'
import { StitchLineRoute } from './StitchLineRoute'

type TPocketStitchLinesProps = {
  componentId: string
}

type PocketStitchRoute = {
  route: ComputedStitchRouteSchema
  stitchLine: ResolvedStitchLineSchema
}

export const TPocketStitchLines: FC<TPocketStitchLinesProps> = ({ componentId }) => {
  const { project } = useProject()
  const { subProject, computedSubProject } = useSubProject()
  const accessor = accessors.subProject(subProject)
  const computedStitchLines = accessors.computedSubProject(computedSubProject).stitchLine.byOnTop(componentId)
  const parentRoutes = useMemo<PocketStitchRoute[]>(() => {
    const accessor = accessors.subProject(subProject)
    const computedAccessor = accessors.computedSubProject(computedSubProject)
    const parent = accessor.optional.component.parent(componentId)
    if (!isDefined(parent)) {
      return []
    }
    return accessor.stitchLine
      .byOwner(parent.id)
      .filter(narrowers.is.tPocketStitchLine)
      .flatMap((stitchLine): PocketStitchRoute[] => {
        const routes = computedAccessor.stitchLine
          .byId(stitchLine.id)
          .routes.filter((route) => route.targetId === componentId)
        const resolvedStitchLine = getResolvedStitchLine(stitchLine, project.stitchingSettings)
        return routes.map((route): PocketStitchRoute => ({ route, stitchLine: resolvedStitchLine }))
      })
  }, [componentId, subProject, computedSubProject, project.stitchingSettings])

  return (
    <>
      {computedStitchLines.map((computedStitchLine) => {
        const stitchLine = accessor.optional.stitchLine.tPocket(computedStitchLine.stitchLineId)

        if (!isDefined(stitchLine)) {
          return null
        }

        const resolvedStitchLine = getResolvedStitchLine(stitchLine, project.stitchingSettings)
        return (
          <StitchLine key={stitchLine.id} computedStitchLine={computedStitchLine} stitchLine={resolvedStitchLine} />
        )
      })}
      {parentRoutes.map(({ route, stitchLine }, index) => (
        <StitchLineRoute key={`${stitchLine.id}-${index}`} route={route} stitchLine={stitchLine} />
      ))}
    </>
  )
}
