import type { SubProjectSchema } from '../../schemas/subProject'
import { isDefined } from '../../utils/isDefined'
import {
  cloneComponentTree,
  type CloneComponentIdGenerators,
  type CloneComponentNameGenerators,
  type CloneComponentSettings,
} from './cloneComponentTree'
import { canCloneComponent } from './utils/componentRules'
import { getComponentParent } from './utils/getComponentParent'

export type CloneComponentParams = {
  componentId: string
  ids: CloneComponentIdGenerators
  names: CloneComponentNameGenerators
  settings: CloneComponentSettings
}

export const cloneComponent = (
  subProject: SubProjectSchema,
  { componentId, ids, names, settings }: CloneComponentParams,
): SubProjectSchema => {
  const sourceComponent = subProject.components[componentId]

  if (!isDefined(sourceComponent) || !canCloneComponent(sourceComponent)) {
    return subProject
  }

  const sourceParent = getComponentParent(componentId, subProject)

  if (!isDefined(sourceParent)) {
    return subProject
  }

  const sourceIndex = sourceParent.children.indexOf(componentId)

  if (sourceIndex < 0) {
    return subProject
  }

  const cloneResult = cloneComponentTree({ subProject, componentId, settings, ids, names })

  if (!isDefined(cloneResult)) {
    return subProject
  }

  const clonedSubProject: SubProjectSchema = {
    ...subProject,
    components: {
      ...subProject.components,
      ...cloneResult.clonedComponents,
      [sourceParent.id]: {
        ...sourceParent,
        children: [
          ...sourceParent.children.slice(0, sourceIndex + 1),
          cloneResult.clonedRootId,
          ...sourceParent.children.slice(sourceIndex + 1),
        ],
      },
    },
    holes: [...subProject.holes, ...cloneResult.clonedHoles],
    stitchLines: [...subProject.stitchLines, ...cloneResult.clonedStitchLines],
  }

  return clonedSubProject
}
