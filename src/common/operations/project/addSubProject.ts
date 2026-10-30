import type { ProjectSchema } from '../../schemas/project'
import type { SubProjectSchema } from '../../schemas/subProject'
import { accessors } from '../../utils/accessors'
import { createSubProject } from '../../utils/createSubProject'
import { isDefined } from '../../utils/isDefined'
import { getUnusedName } from '../subProject/utils/getUnusedName'

type AddSubProjectParams = {
  baseRootComponentName: string
}

type AddSubProjectResult = {
  project: ProjectSchema
  subProject: SubProjectSchema
}

export const addSubProject = (
  project: ProjectSchema,
  { baseRootComponentName }: AddSubProjectParams,
): AddSubProjectResult => {
  const usedRootNames = new Set(
    project.subProjects
      .map((subProject) => accessors.subProject(subProject).optional.rootPanel())
      .filter(isDefined)
      .map((rootPanel) => rootPanel.name),
  )
  const subProject = createSubProject(getUnusedName(baseRootComponentName, usedRootNames), project.stitchingSettings)

  return {
    project: {
      ...project,
      subProjects: [...project.subProjects, subProject],
    },
    subProject,
  }
}
