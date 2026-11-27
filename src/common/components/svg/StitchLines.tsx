import { useMemo, type FC, type ReactNode } from 'react'
import { useSvgFace } from '../../contexts/SvgFaceContext'
import { useProject } from '../../hooks/useProject'
import { useSubProject } from '../../hooks/useSubProject'
import type { ComputedStitchRouteSchema } from '../../schemas/computed'
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
  const { accessor, computedAccessor } = useSubProject()
  const { faceId } = useSvgFace()
  const entryRoutes = surface === 'front' ? computedAccessor.stitchLine.byEntry(componentId) : []
  const exitRoutes = useMemo<ComputedStitchRouteSchema[]>(() => {
    return computedAccessor.stitchLine
      .byExit(componentId)
      .filter((route) => (surface === 'front' ? route.faceId !== faceId : route.faceId === faceId))
  }, [computedAccessor, componentId, faceId, surface])

  const renderRoute = (route: ComputedStitchRouteSchema, index: number, portalSelection: boolean): ReactNode => {
    const stitchLine = accessor.optional.stitchLine.byId(route.stitchLineId)
    if (!isDefined(stitchLine)) {
      return null
    }
    return (
      <StitchLineRoute
        key={`${portalSelection ? 'entry' : 'exit'}:${route.stitchLineId}:${index}`}
        route={route}
        stitchLine={getResolvedStitchLine(stitchLine, project.stitchingSettings)}
        portalSelection={portalSelection}
      />
    )
  }

  return (
    <>
      {entryRoutes.map((route, index) => renderRoute(route, index, true))}
      {exitRoutes.map((route, index) => renderRoute(route, index, false))}
    </>
  )
}
