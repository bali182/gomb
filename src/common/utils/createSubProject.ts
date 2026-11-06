import type { ReadonlyModelObjectFactorySchema } from '../schemas/factory'
import type { ProjectSchema } from '../schemas/project'
import type { SubProjectSchema } from '../schemas/subProject'
import { accessors } from './accessors'
import { getProjectIds } from './idCollectorUtils'
import { isDefined } from './isDefined'
import { IdGenerator } from './random/IdGenerator'

export type CreateSubProjectParams = {
  project: ProjectSchema
  modelFactory: ReadonlyModelObjectFactorySchema
}

export const createSubProject = ({ project, modelFactory }: CreateSubProjectParams): SubProjectSchema => {
  const forbiddenIds = getProjectIds(project)
  const forbiddenNames = new Set(
    project.subProjects
      .map((subProject) => accessors.subProject(subProject).optional.component.rootPanel())
      .filter(isDefined)
      .map((root) => root.name),
  )
  const root = modelFactory.createRootPanel({
    stitchingSettings: project.stitchingSettings,
    forbiddenIds,
    forbiddenNames,
  })
  const defaultPocketOpening = modelFactory.createStraightPocketOpening({ forbiddenIds })
  return {
    id: new IdGenerator().get('sub-project', forbiddenIds),
    root: root.id,
    defaultPocketOpening: defaultPocketOpening.id,
    pocketOpenings: { [defaultPocketOpening.id]: defaultPocketOpening },
    components: { [root.id]: root },
    constraints: {},
    holes: [],
    stitchLines: [],
  }
}
