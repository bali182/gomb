import { defaultStitchingSettings } from './defaultStates'
import { createComponent } from './operations/subProject/utils/createComponent'
import { createHole } from './operations/subProject/utils/createHole'
import { createPocketOpening } from './operations/subProject/utils/createPocketOpening'
import { createStitchLine } from './operations/subProject/utils/createStitchLine'
import { HasComponentReferenceSchema, HasComponentTargetSchema, HasId, HasTargetSchema } from './schemas/common'
import {
  ComponentSchema,
  FrontPocketSchema,
  PanelSchema,
  PocketClusterSchema,
  RootPanelSchema,
  TPocketSchema,
} from './schemas/components'
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
import { accessors } from './utils/accessors'
import { createProject } from './utils/createProject'
import { createSubProject } from './utils/createSubProject'
import { id as generateId } from './utils/id'
import { isDefined } from './utils/isDefined'
import { narrowers } from './utils/narrowers'

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
  }

type CreateRootPanelConfig = Partial<RootPanelSchema> & HasId & HasStitchingSettings
type CreatePanelConfig = Partial<PanelSchema> & HasId & HasStitchingSettings
type CreatePocketClusterConfig = Partial<PocketClusterSchema> & HasId & HasStitchingSettings

type CreateHoleConfig = Partial<HoleSchema> & HasId & HasComponentReferenceSchema

type CreateComponentBoundsStitchLineConfig = Partial<ComponentBoundsStitchLineSchema> & HasId & HasTargetSchema
type CreateTPocketStitchLineConfig = Partial<TPocketStitchLineSchema> & HasId & HasComponentTargetSchema

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
    stitchingSettings = defaultStitchingSettings,
  }: CreateSubProjectConfig): SubProjectSchema => {
    const subProject = createSubProject(id, stitchingSettings, 'Straight')
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
    subProject.holes = holes
    const accessor = accessors.subProject(subProject)
    for (const component of components) {
      if (narrowers.is.pocket(component) && !isDefined(accessor.optional.pocketOpening.byId(component.openingId))) {
        subProject.pocketOpenings[component.openingId] = createPocketOpening({
          type: 'straight',
          id: component.openingId,
          name: component.openingId,
        })
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
      ...createComponent({ type: 'root-panel', id, name: id, stitchingSettings }),
      ...rest,
    }
  },

  panel: ({ id, stitchingSettings = defaultStitchingSettings, ...rest }: CreatePanelConfig): PanelSchema => {
    return {
      ...createComponent({ type: 'panel', id, name: id, stitchingSettings }),
      ...rest,
    }
  },

  pocketCluster: ({
    id,
    stitchingSettings = defaultStitchingSettings,
    ...rest
  }: CreatePocketClusterConfig): PocketClusterSchema => {
    return {
      ...createComponent({
        type: 'pocket-cluster',
        id,
        name: id,
        stitchingSettings,
      }),
      ...rest,
    }
  },

  frontPocket: ({
    id,
    stitchingSettings = defaultStitchingSettings,
    openingId = generateId(),
    ...rest
  }: Partial<FrontPocketSchema> & HasId & HasStitchingSettings): FrontPocketSchema => ({
    ...createComponent<FrontPocketSchema>({
      type: 'front-pocket',
      id,
      name: id,
      openingId,
      stitchingSettings,
    }),
    ...rest,
  }),
  tPocket: ({
    id,
    stitchingSettings = defaultStitchingSettings,
    openingId = generateId(),
    ...rest
  }: Partial<TPocketSchema> & HasId & HasStitchingSettings): TPocketSchema => ({
    ...createComponent<TPocketSchema>({
      type: 't-pocket',
      id,
      name: id,
      openingId,
      stitchingSettings,
    }),
    ...rest,
  }),

  hole: ({ id, componentId, ...rest }: CreateHoleConfig): HoleSchema => {
    return { ...createHole({ id, name: id, componentId, ...rest }) }
  },

  componentBoundsStitchLine: ({
    id,
    targetId,
    targetType,
    ...rest
  }: CreateComponentBoundsStitchLineConfig): ComponentBoundsStitchLineSchema => {
    const stitchLine = narrowers.assert.componentBoundsStitchLine(
      createStitchLine('component-bounds-stitch-line', { targetId, targetType }, id, id),
    )
    return { ...stitchLine, ...rest }
  },

  tPocketStitchLine: ({
    id,
    targetId,
    targetType,
    ...rest
  }: CreateTPocketStitchLineConfig): TPocketStitchLineSchema => {
    const stitchLine = narrowers.assert.tPocketStitchLine(
      createStitchLine('t-pocket-stitch-line', { targetId, targetType }, id, id),
    )
    return { ...stitchLine, ...rest }
  },
}
