import { useMemo, type FC } from 'react'
import { useSvgFace } from '../../contexts/SvgFaceContext'
import { useProject } from '../../hooks/useProject'
import { useSubProject } from '../../hooks/useSubProject'
import type { ComputedStitchRouteSchema } from '../../schemas/computed'
import { accessors } from '../../utils/accessors'
import { getResolvedStitchLine } from '../../utils/getResolvedStitchLine'
import { isDefined } from '../../utils/isDefined'
import { StitchLineRoute } from './StitchLineRoute'

type StitchLinesProps = {
  componentId: string
  /**
   * Selects stitches behind ("back") or in front of ("front") the component's material.
   * Panels and pockets render both groups with their material between them, allowing
   * the material to occlude the back group except through cutouts or transparency.
   * Both calls share the same face context, so its direction cannot distinguish these groups.
   */
  surface: 'front' | 'back'
}

export const StitchLines: FC<StitchLinesProps> = ({ componentId, surface }) => {
  const { project } = useProject()
  const { subProject, computedSubProject } = useSubProject()
  const { faceId } = useSvgFace()
  const routes = useMemo<ComputedStitchRouteSchema[]>(() => {
    const accessor = accessors.computedSubProject(computedSubProject)
    const exitRoutes = accessor.stitchLine
      .byExit(componentId)
      .filter((route) => (surface === 'front' ? route.faceId !== faceId : route.faceId === faceId))
    return surface === 'front' ? [...accessor.stitchLine.byEntry(componentId), ...exitRoutes] : exitRoutes
  }, [computedSubProject, componentId, faceId, surface])
  const accessor = accessors.subProject(subProject)

  return (
    <>
      {routes.map((route, index) => {
        const stitchLine = accessor.optional.stitchLine.byId(route.stitchLineId)
        if (!isDefined(stitchLine)) {
          return null
        }
        return (
          <StitchLineRoute
            key={`${route.stitchLineId}:${index}`}
            route={route}
            stitchLine={getResolvedStitchLine(stitchLine, project.stitchingSettings)}
          />
        )
      })}
    </>
  )
}
