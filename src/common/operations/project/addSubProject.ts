import type { ReadonlyModelObjectFactorySchema } from '../../schemas/factory'
import type { ProjectSchema } from '../../schemas/project'
import type { SubProjectSchema } from '../../schemas/subProject'
import { createSubProject } from '../../utils/createSubProject'

type AddSubProjectParams = {
  modelFactory: ReadonlyModelObjectFactorySchema
}

type AddSubProjectResult = {
  project: ProjectSchema
  subProject: SubProjectSchema
}

export const addSubProject = (project: ProjectSchema, { modelFactory }: AddSubProjectParams): AddSubProjectResult => {
  const subProject = createSubProject({ project, modelFactory })

  return {
    project: {
      ...project,
      subProjects: [...project.subProjects, subProject],
    },
    subProject,
  }
}
