import {
  defaultColorSettings,
  defaultComponentBoundsStitchLine,
  defaultHole,
  defaultPanel,
  defaultPocketCluster,
  defaultPocketClusterStitchLine,
  defaultRootPanel,
  defaultStitchingSettings,
} from '../defaultStates'
import type { PanelSchema, PocketClusterSchema, RootPanelSchema } from '../schemas/components'
import type { HoleSchema } from '../schemas/hole'
import type { ProjectMigratorSchema } from '../schemas/migration'
import type { ProjectSchema } from '../schemas/project'
import type { ColorSettingsSchema } from '../schemas/settings'
import type {
  ComponentBoundsStitchLineSchema,
  PocketClusterStitchLineSchema,
  StitchLineCommonConfigSchema,
} from '../schemas/stitching'
import type { SubProjectSchema } from '../schemas/subProject'
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
  pocketCluster: (input) => {
    const pocketCluster = m.requireObject<PocketClusterSchema>(input)
    m.requireString(pocketCluster, 'id')
    m.requireString(pocketCluster, 'name')
    m.requireValue(pocketCluster, 'type', 'pocket-cluster')

    return m.applyDefaults<PocketClusterSchema>(pocketCluster, defaultPocketCluster)
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
  pocketClusterStitchLine: (input) => {
    const stitchLine = m.requireObject<PocketClusterStitchLineSchema>(input)
    m.requireString(stitchLine, 'id')
    m.requireString(stitchLine, 'name')
    m.requireString(stitchLine, 'targetId')
    m.requireValue(stitchLine, 'targetType', 'component')
    m.requireValue(stitchLine, 'type', 'pocket-cluster-stitch-line')

    return m.applyDefaults<PocketClusterStitchLineSchema>(stitchLine, defaultPocketClusterStitchLine)
  },
}

export const defaultProjectMigrator = createProjectMigration(defaultProjectMigratorSchema)
