import { defaultStitchingSettings } from './defaultStates'
import { HasComponentReferenceSchema, HasComponentTargetSchema, HasId, HasTargetSchema } from './schemas/common'
import {
  ComponentSchema,
  FrontPocketSchema,
  PanelSchema,
  PocketClusterSchema,
  RootPanelSchema,
  TPocketSchema,
} from './schemas/components'
import type { ConstraintSchema } from './schemas/constraints'
import { HoleSchema } from './schemas/hole'
import type { PocketOpeningSchema } from './schemas/pocketOpening'
import { ProjectSchema } from './schemas/project'
import {
  ComponentBoundsStitchLineSchema,
  StitchLineCommonConfigSchema,
  StitchLineSchema,
  TPocketStitchLineSchema,
} from './schemas/stitching'
import { SubProjectSchema } from './schemas/subProject'
import { EN } from './translations/en'
import { accessors } from './utils/accessors'
import { createProject } from './utils/createProject'
import { createSubProject } from './utils/createSubProject'
import { NameGenerator } from './utils/factory/NameGenerator'
import { ReadonlyModelObjectFactory } from './utils/factory/ReadonlyModelObjectFactory'
import { isDefined } from './utils/isDefined'
import { narrowers } from './utils/narrowers'
import { IdGenerator } from './utils/random/IdGenerator'

type HasStitchingSettings = {
  stitchingSettings?: StitchLineCommonConfigSchema
}

type CreateTestProjectConfig = HasId &
  HasStitchingSettings & {
    subProjects: SubProjectSchema[]
  }

type CreateSubProjectConfig = HasId &
  HasStitchingSettings & {
    root: RootPanelSchema
    components?: ComponentSchema[]
    stitchLines?: StitchLineSchema[]
    holes?: HoleSchema[]
    pocketOpenings?: PocketOpeningSchema[]
    constraints?: Record<string, ConstraintSchema>
  }

type CreateRootPanelConfig = Partial<RootPanelSchema> & HasId & HasStitchingSettings
type CreatePanelConfig = Partial<PanelSchema> & HasId & HasStitchingSettings
type CreatePocketClusterConfig = Partial<PocketClusterSchema> & HasId & HasStitchingSettings

type CreateHoleConfig = Partial<HoleSchema> & HasId & HasComponentReferenceSchema

type CreateComponentBoundsStitchLineConfig = Partial<ComponentBoundsStitchLineSchema> & HasId & HasTargetSchema
type CreateTPocketStitchLineConfig = Partial<TPocketStitchLineSchema> & HasId & HasComponentTargetSchema

const idGenerator = new IdGenerator()
const modelFactory = new ReadonlyModelObjectFactory(idGenerator, new NameGenerator(EN.defaultNames))

export const d = {
  project: ({ id, subProjects, stitchingSettings }: CreateTestProjectConfig): ProjectSchema => {
    const project = createProject(id)
    project.id = id
    project.subProjects = subProjects
    if (isDefined(stitchingSettings)) {
      project.stitchingSettings = stitchingSettings
    }
    return project
  },

  subProject: ({
    id,
    root,
    components = [],
    stitchLines = [],
    holes = [],
    pocketOpenings = [],
    constraints = {},
    stitchingSettings = defaultStitchingSettings,
  }: CreateSubProjectConfig): SubProjectSchema => {
    const subProject = createSubProject({ project: { ...createProject(id), stitchingSettings }, modelFactory })
    subProject.id = id
    subProject.root = root.id
    subProject.components = {
      [root.id]: root,
    }
    for (const component of components) {
      subProject.components[component.id] = component
    }
    subProject.stitchLines = stitchLines
    subProject.pocketOpenings = {
      ...subProject.pocketOpenings,
      ...Object.fromEntries(pocketOpenings.map((opening) => [opening.id, opening])),
    }
    subProject.constraints = constraints
    subProject.holes = holes
    const accessor = accessors.subProject(subProject)
    for (const component of components) {
      if (narrowers.is.pocket(component) && !isDefined(accessor.optional.pocketOpening.byId(component.openingId))) {
        subProject.pocketOpenings[component.openingId] = {
          ...modelFactory.createStraightPocketOpening({}),
          id: component.openingId,
          name: component.openingId,
        }
      }
    }
    return subProject
  },

  rootPanel: ({
    id,
    stitchingSettings = defaultStitchingSettings,
    ...rest
  }: CreateRootPanelConfig): RootPanelSchema => {
    return {
      ...modelFactory.createRootPanel({ stitchingSettings }),
      id,
      name: id,
      ...rest,
    }
  },

  panel: ({ id, stitchingSettings: _stitchingSettings, ...rest }: CreatePanelConfig): PanelSchema => {
    return {
      ...modelFactory.createPanel({}),
      id,
      name: id,
      ...rest,
    }
  },

  pocketCluster: ({
    id,
    stitchingSettings = defaultStitchingSettings,
    ...rest
  }: CreatePocketClusterConfig): PocketClusterSchema => {
    return {
      ...modelFactory.createPocketCluster({ stitchingSettings }),
      id,
      name: id,
      ...rest,
    }
  },

  frontPocket: ({
    id,
    stitchingSettings: _stitchingSettings,
    openingId = idGenerator.get('straight-pocket-opening'),
    ...rest
  }: Partial<FrontPocketSchema> & HasId & HasStitchingSettings): FrontPocketSchema => ({
    ...modelFactory.createFrontPocket({ openingId }),
    id,
    name: id,
    ...rest,
  }),
  tPocket: ({
    id,
    stitchingSettings: _stitchingSettings,
    openingId = idGenerator.get('straight-pocket-opening'),
    ...rest
  }: Partial<TPocketSchema> & HasId & HasStitchingSettings): TPocketSchema => ({
    ...modelFactory.createTPocket({ openingId }),
    id,
    name: id,
    ...rest,
  }),

  hole: ({ id, componentId, ...rest }: CreateHoleConfig): HoleSchema => {
    return { ...modelFactory.createHole({ componentId }), id, name: id, ...rest }
  },

  componentBoundsStitchLine: ({
    id,
    targetId,
    targetType,
    ...rest
  }: CreateComponentBoundsStitchLineConfig): ComponentBoundsStitchLineSchema => {
    const stitchLine = modelFactory.createComponentBoundsStitchLine({ targetId, targetType })
    return { ...stitchLine, id, name: id, ...rest }
  },

  tPocketStitchLine: ({
    id,
    targetId,
    targetType,
    ...rest
  }: CreateTPocketStitchLineConfig): TPocketStitchLineSchema => {
    const stitchLine = modelFactory.createTPocketStitchLine({ targetId, targetType })
    return { ...stitchLine, id, name: id, ...rest }
  },
}
