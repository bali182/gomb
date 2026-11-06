import type { NameGeneratorSchema } from '../../schemas/idGenerator'
import type { SubProjectSchema } from '../../schemas/subProject'
import { accessors } from '../../utils/accessors'
import { isDefined } from '../../utils/isDefined'
import { cloneComponentTree, type CloneComponentSettings } from './cloneComponentTree'
import { canCloneComponent } from './utils/componentRules'
import { getCloneIdMappings } from './utils/getCloneIdMappings'

export type CloneComponentParams = {
  componentId: string
  nameGenerator: NameGeneratorSchema
  settings: CloneComponentSettings
}

export const cloneComponent = (
  subProject: SubProjectSchema,
  { componentId, nameGenerator, settings }: CloneComponentParams,
): SubProjectSchema => {
  const accessor = accessors.subProject(subProject)
  const sourceComponent = accessor.optional.component.byId(componentId)

  if (!isDefined(sourceComponent) || !canCloneComponent(sourceComponent)) {
    return subProject
  }

  const sourceParent = accessor.optional.component.parent(componentId)

  if (!isDefined(sourceParent)) {
    return subProject
  }

  const sourceIndex = sourceParent.children.indexOf(componentId)

  if (sourceIndex < 0) {
    return subProject
  }

  const idMappings = getCloneIdMappings(subProject)
  const cloneResult = cloneComponentTree({
    subProject,
    componentId,
    settings,
    idMappings,
    nameGenerator,
    preserveNames: false,
  })

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
