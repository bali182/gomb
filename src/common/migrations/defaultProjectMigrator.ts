import {
  defaultColorSettings,
  defaultComponentBoundsStitchLine,
  defaultFrontPocket,
  defaultHole,
  defaultOpticalIllusionPocketOpening,
  defaultPanel,
  defaultPocketCluster,
  defaultRecessedPocketOpening,
  defaultRootPanel,
  defaultSlantedPocketOpening,
  defaultStitchingSettings,
  defaultTPocket,
  defaultTPocketStitchLine,
} from '../defaultStates'
import type {
  FrontPocketSchema,
  OpticalIllusionPocketOpeningSchema,
  PanelSchema,
  PocketClusterSchema,
  PocketOpeningSchema,
  RecessedPocketOpeningSchema,
  RootPanelSchema,
  SlantedPocketOpeningSchema,
  TPocketSchema,
} from '../schemas/components'
import type { HoleSchema } from '../schemas/hole'
import type { ProjectMigratorSchema } from '../schemas/migration'
import type { ProjectSchema } from '../schemas/project'
import type { ColorSettingsSchema } from '../schemas/settings'
import type {
  ComponentBoundsStitchLineSchema,
  StitchLineCommonConfigSchema,
  TPocketStitchLineSchema,
} from '../schemas/stitching'
import type { SubProjectSchema } from '../schemas/subProject'
import type { DeepPartialSchema } from '../schemas/utils'
import { createProjectMigration } from './createProjectMigration'
import { m } from './migrationUtils'

const defaultProjectMigratorSchema: ProjectMigratorSchema = {
  project: (input) => {
    const project = m.requireObject(input)
    m.requireString(project, 'id')
    m.requireString(project, 'name')
    m.requireArray(project, 'subProjects')

    return m.applyDefaults<ProjectSchema>(project, {
      colorSettings: {},
      stitchingSettings: {},
    })
  },
  subProject: (input) => {
    const subProject = m.requireObject(input)
    m.requireString(subProject, 'id')
    m.requireString(subProject, 'root')
    m.requireObjectField(subProject, 'components')

    return m.applyDefaults<SubProjectSchema>(subProject, {
      holes: [],
      stitchLines: [],
      locks: { components: {} },
    })
  },
  colorSettings: (input) => {
    return m.applyDefaults<ColorSettingsSchema>(m.requireObject(input), defaultColorSettings)
  },
  stitchingSettings: (input) => {
    return m.applyDefaults<StitchLineCommonConfigSchema>(m.requireObject(input), defaultStitchingSettings)
  },
  rootPanel: (input) => {
    const rootPanel = m.requireObject<RootPanelSchema>(input)
    m.requireString(rootPanel, 'id')
    m.requireString(rootPanel, 'name')
    m.requireValue(rootPanel, 'type', 'root-panel')

    return m.applyDefaults<RootPanelSchema>(rootPanel, defaultRootPanel)
  },
  panel: (input) => {
    const panel = m.requireObject<PanelSchema>(input)
    m.requireString(panel, 'id')
    m.requireString(panel, 'name')
    m.requireValue(panel, 'type', 'panel')

    return m.applyDefaults<PanelSchema>(panel, defaultPanel)
  },
  pocketCluster: (input) => m.applyDefaults<PocketClusterSchema>(m.requireObject(input), defaultPocketCluster),
  frontPocket: (input) => {
    const pocket = m.applyDefaults<FrontPocketSchema>(m.requireObject(input), defaultFrontPocket)
    pocket.opening = migratePocketOpening(pocket.opening ?? { type: 'straight' })
    return pocket
  },
  tPocket: (input) => {
    const pocket = m.applyDefaults<TPocketSchema>(m.requireObject(input), defaultTPocket)
    pocket.opening = migratePocketOpening(pocket.opening ?? { type: 'straight' })
    return pocket
  },
  hole: (input) => {
    const hole = m.requireObject<HoleSchema>(input)
    m.requireString(hole, 'id')
    m.requireString(hole, 'name')
    m.requireString(hole, 'componentId')
    m.requireValue(hole, 'type', 'hole')

    return m.applyDefaults<HoleSchema>(hole, defaultHole)
  },
  componentBoundsStitchLine: (input) => {
    const stitchLine = m.requireObject<ComponentBoundsStitchLineSchema>(input)
    m.requireString(stitchLine, 'id')
    m.requireString(stitchLine, 'name')
    m.requireString(stitchLine, 'targetId')
    m.requirePrimitiveUnion(stitchLine, 'targetType', ['component', 'hole'])
    m.requireValue(stitchLine, 'type', 'component-bounds-stitch-line')

    return m.applyDefaults<ComponentBoundsStitchLineSchema>(stitchLine, defaultComponentBoundsStitchLine)
  },
  tPocketStitchLine: (input) => {
    const stitchLine = m.requireObject<TPocketStitchLineSchema>(input)
    m.requireString(stitchLine, 'id')
    m.requireString(stitchLine, 'name')
    m.requireString(stitchLine, 'targetId')
    m.requireValue(stitchLine, 'targetType', 'component')
    m.requireValue(stitchLine, 'type', 't-pocket-stitch-line')

    return m.applyDefaults<TPocketStitchLineSchema>(stitchLine, defaultTPocketStitchLine)
  },
}

const migratePocketOpening = (
  input: DeepPartialSchema<PocketOpeningSchema>,
): DeepPartialSchema<PocketOpeningSchema> => {
  const opening = m.requireObject<PocketOpeningSchema>(input)
  m.requirePrimitiveUnion(opening, 'type', ['straight', 'recessed', 'slanted', 'optical-illusion'])

  switch (opening.type) {
    case 'optical-illusion':
      return m.applyDefaults<OpticalIllusionPocketOpeningSchema>(opening, defaultOpticalIllusionPocketOpening)
    case 'straight':
      return { type: 'straight' }
    case 'recessed':
      return m.applyDefaults<RecessedPocketOpeningSchema>(opening, defaultRecessedPocketOpening)
    case 'slanted':
      return m.applyDefaults<SlantedPocketOpeningSchema>(opening, defaultSlantedPocketOpening)
    default:
      throw new Error('Missing pocket opening type')
  }
}

export const defaultProjectMigrator = createProjectMigration(defaultProjectMigratorSchema)
