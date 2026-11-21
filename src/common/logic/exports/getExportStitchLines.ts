import type { ComputedComponentSchema, ComputedStitchRouteSchema } from '../../schemas/computed'
import type { ExportStitchLineSchema } from '../../schemas/export'
import type { StitchLineCommonConfigSchema } from '../../schemas/stitching'
import type { ComputedSubProjectSchema, SubProjectSchema } from '../../schemas/subProject'
import { accessors } from '../../utils/accessors'
import { getResolvedStitchLine } from '../../utils/getResolvedStitchLine'
import { isDefined } from '../../utils/isDefined'
import { narrowers } from '../../utils/narrowers'
import { clipPathToClosedPath } from '../clipPathToClosedPath'
import { reflectPathHorizontally, reflectPointHorizontally } from '../geometryUtils'
import { isPointInClosedPath } from '../isPointInClosedPath'

export const getExportStitchLines = (
  subProject: SubProjectSchema,
  computedSubProject: ComputedSubProjectSchema,
  target: ComputedComponentSchema,
  stitchingSettings: StitchLineCommonConfigSchema,
): ExportStitchLineSchema[] => {
  const accessor = accessors.subProject(subProject)
  const computedAccessor = accessors.computedSubProject(computedSubProject)
  const root = accessor.component.rootPanel()
  const computedRoot = computedAccessor.component.rootPanel()
  const axisX = computedRoot.boundingRect.x.plus(computedRoot.boundingRect.width.dividedBy(2))
  const targetIsRoot = narrowers.is.computedRootPanel(target) || narrowers.is.computedRootPanelFace(target)
  const targetId = targetIsRoot ? root.id : target.componentId
  const targetFaceId = targetIsRoot ? root.frontFaceId : accessor.component.rootPanelFaceOf(targetId).id

  return Object.values(computedSubProject.stitchLines).flatMap((computedStitchLine): ExportStitchLineSchema[] => {
    const stitchLine = accessor.optional.stitchLine.byId(computedStitchLine.stitchLineId)
    if (!isDefined(stitchLine)) {
      return []
    }
    const routes = computedStitchLine.routes.filter((route) => {
      const layers = accessor.component.layerIds(route.faceId)
      const entry = accessor.component.byId(route.entryComponentId)
      const exit = accessor.component.byId(route.exitComponentId)
      const entryIndex = layers.indexOf(narrowers.is.rootPanelFace(entry) ? root.id : entry.id)
      const exitIndex = layers.indexOf(narrowers.is.rootPanelFace(exit) ? root.id : exit.id)
      const targetIndex = layers.indexOf(targetId)
      return targetIndex >= 0 && targetIndex <= entryIndex && targetIndex >= exitIndex
    })
    const paths = routes.flatMap((route) => {
      const path = route.faceId === targetFaceId ? route.path : reflectPathHorizontally(route.path, axisX)
      return clipPathToClosedPath(path, target.path)
    })
    const holes = routes.flatMap((route: ComputedStitchRouteSchema) =>
      route.holes
        .map((hole) => {
          if (route.faceId === targetFaceId) {
            return hole
          }
          return {
            center: reflectPointHorizontally(hole.center, axisX),
            rotation: (90 - hole.rotation + 360) % 360,
            line: {
              start: reflectPointHorizontally(hole.line.start, axisX),
              end: reflectPointHorizontally(hole.line.end, axisX),
            },
          }
        })
        .filter((hole) => isPointInClosedPath(hole.center, target.path)),
    )
    if (paths.length === 0 && holes.length === 0) {
      return []
    }
    return [{ stitchLine: getResolvedStitchLine(stitchLine, stitchingSettings), paths, holes }]
  })
}
