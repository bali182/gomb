import type { ComputedComponentSchema, ComputedHoleSchema } from '../schemas/computed'
import type { PathSchema } from '../schemas/geometry'
import { isDefined } from '../utils/isDefined'
import { narrowers } from '../utils/narrowers'
import { subtractClosedPaths } from './closedPathBooleanUtils'
import { reflectPathHorizontally } from './geometryUtils'

export const applyHolePathsToComputedComponents = (
  components: Record<string, ComputedComponentSchema>,
  holes: readonly ComputedHoleSchema[],
): void => {
  const holePathsByComponent = groupHolePathsByComponent(holes)

  Object.values(components).forEach((component) => {
    if (narrowers.is.computedRootPanelFace(component)) {
      return
    }
    if (narrowers.is.computedRootPanel(component)) {
      const frontFace = narrowers.assert.computedRootPanelFace(components[component.frontFaceId])
      const backFace = narrowers.assert.computedRootPanelFace(components[component.backFaceId])
      const axisX = component.boundingRect.x.plus(component.boundingRect.width.dividedBy(2))
      const rootHolePaths = [
        ...(holePathsByComponent.get(component.componentId) ?? []),
        ...(holePathsByComponent.get(frontFace.componentId) ?? []),
        ...(holePathsByComponent.get(backFace.componentId) ?? []).map((path) => reflectPathHorizontally(path, axisX)),
      ]
      component.path = subtractClosedPaths(component.path, rootHolePaths)
      frontFace.path = component.path
      backFace.path = reflectPathHorizontally(component.path, axisX)
      return
    }
    const holePaths = holePathsByComponent.get(component.componentId)

    if (!isDefined(holePaths)) {
      return
    }

    component.path = subtractClosedPaths(component.path, holePaths)
  })
}

const groupHolePathsByComponent = (holes: readonly ComputedHoleSchema[]): Map<string, PathSchema[]> => {
  const holePathsByComponent = new Map<string, PathSchema[]>()

  holes.forEach((hole) => {
    const holePaths = holePathsByComponent.get(hole.componentId)

    if (isDefined(holePaths)) {
      holePaths.push(hole.path)
      return
    }

    holePathsByComponent.set(hole.componentId, [hole.path])
  })

  return holePathsByComponent
}
