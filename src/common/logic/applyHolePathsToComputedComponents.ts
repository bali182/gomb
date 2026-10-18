import type { ComputedComponentSchema, ComputedHoleSchema } from '../schemas/computed'
import type { PathSchema } from '../schemas/geometry'
import { isDefined } from '../utils/isDefined'
import { subtractClosedPaths } from './closedPathBooleanUtils'

export const applyHolePathsToComputedComponents = (
  components: Record<string, ComputedComponentSchema>,
  holes: readonly ComputedHoleSchema[],
): void => {
  const holePathsByComponent = groupHolePathsByComponent(holes)

  Object.values(components).forEach((component) => {
    const holePaths = holePathsByComponent.get(component.componentId)

    if (!isDefined(holePaths)) {
      return
    }

    component.path = subtractClosedPaths(component.path, holePaths)

    if (component.type !== 'computed-pocket-cluster') {
      return
    }

    component.frontPocket.path = subtractClosedPaths(component.frontPocket.path, holePaths)
    component.tPockets.forEach((pocket) => {
      pocket.path = subtractClosedPaths(pocket.path, holePaths)
    })
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
