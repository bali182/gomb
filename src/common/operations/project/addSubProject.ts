import type { RootPanelFaceSideSchema } from '../../schemas/components'
import type { ReadonlyModelObjectFactorySchema } from '../../schemas/factory'
import type { ProjectSchema } from '../../schemas/project'
import type { SubProjectSchema } from '../../schemas/subProject'
import { createSubProject } from '../../utils/createSubProject'

type AddSubProjectParams = {
  modelFactory: ReadonlyModelObjectFactorySchema
  faceNames: Record<RootPanelFaceSideSchema, string>
}

type AddSubProjectResult = {
  project: ProjectSchema
  subProject: SubProjectSchema
}

export const addSubProject = (
  project: ProjectSchema,
  { modelFactory, faceNames }: AddSubProjectParams,
): AddSubProjectResult => {
  const subProject = createSubProject({ project, modelFactory, faceNames })

  return {
    project: {
      ...project,
      subProjects: [...project.subProjects, subProject],
    },
    subProject,
  }
}
