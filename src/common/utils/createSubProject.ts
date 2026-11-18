import type { RootPanelFaceSideSchema } from '../schemas/components'
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
  faceNames: Record<RootPanelFaceSideSchema, string>
}

export const createSubProject = ({ project, modelFactory, faceNames }: CreateSubProjectParams): SubProjectSchema => {
  const forbiddenIds = getProjectIds(project)
  const forbiddenNames = new Set(
    project.subProjects
      .map((subProject) => accessors.subProject(subProject).optional.component.rootPanel())
      .filter(isDefined)
      .map((root) => root.name),
  )
  const frontFace = modelFactory.createRootPanelFace({ forbiddenIds, name: faceNames.front })
  forbiddenIds.add(frontFace.id)
  const backFace = modelFactory.createRootPanelFace({ forbiddenIds, name: faceNames.back })
  forbiddenIds.add(backFace.id)
  const root = modelFactory.createRootPanel({
    frontFaceId: frontFace.id,
    backFaceId: backFace.id,
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
    components: { [root.id]: root, [frontFace.id]: frontFace, [backFace.id]: backFace },
    bindings: {},
    holes: [],
    stitchLines: [],
  }
}
