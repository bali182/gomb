import type { ProjectSchema } from '../../schemas/project'
import type { SubProjectSchema } from '../../schemas/subProject'
import { accessors } from '../../utils/accessors'
import { isDefined } from '../../utils/isDefined'
import { cloneComponentTree } from '../subProject/cloneComponentTree'
import { getUnusedName } from '../subProject/utils/getUnusedName'

export type CloneSubProjectParams = {
  getUnusedId: () => string
  subProject: SubProjectSchema
}

export const cloneSubProject = (
  project: ProjectSchema,
  { getUnusedId, subProject: sourceSubProject }: CloneSubProjectParams,
): ProjectSchema => {
  const sourceRootPanel = accessors.subProject(sourceSubProject).optional.rootPanel()

  if (!isDefined(sourceRootPanel)) {
    return project
  }

  const cloneResult = cloneComponentTree({
    subProject: sourceSubProject,
    componentId: sourceSubProject.root,
    settings: { cloneComponentTree: true, cloneHoles: true, cloneStitchLines: true },
    ids: {
      component: getUnusedId,
      hole: getUnusedId,
      stitchLine: getUnusedId,
    },
    names: {
      component: (sourceName) => sourceName,
      hole: (sourceName) => sourceName,
      stitchLine: (sourceName) => sourceName,
    },
  })

  if (!isDefined(cloneResult)) {
    return project
  }

  const clonedRoot = cloneResult.clonedComponents[cloneResult.clonedRootId]

  if (!isDefined(clonedRoot)) {
    return project
  }

  const usedRootNames = new Set(
    project.subProjects
      .map((subProject) => accessors.subProject(subProject).optional.rootPanel())
      .filter(isDefined)
      .map((root) => root.name),
  )
  const rootName = getUnusedName(sourceRootPanel.name, usedRootNames)

  return {
    ...project,
    subProjects: [
      ...project.subProjects,
      {
        components: {
          ...cloneResult.clonedComponents,
          [cloneResult.clonedRootId]: {
            ...clonedRoot,
            name: rootName,
          },
        },
        holes: cloneResult.clonedHoles,
        id: getUnusedId(),
        root: cloneResult.clonedRootId,
        stitchLines: cloneResult.clonedStitchLines,
      },
    ],
  }
}
