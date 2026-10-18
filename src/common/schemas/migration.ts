import type { TranslationSchema } from '../translations/translationSchema'
import type { PanelSchema, PocketClusterSchema, RootPanelSchema } from './components'
import type { HoleSchema } from './hole'
import type { ProjectSchema } from './project'
import type { ColorSettingsSchema, GlobalSettingsSchema } from './settings'
import type {
  ComponentBoundsStitchLineSchema,
  PocketClusterStitchLineSchema,
  StitchLineCommonConfigSchema,
} from './stitching'
import type { SubProjectSchema } from './subProject'

import type { DeepPartialSchema } from './utils'

export type ProjectMigrationContextSchema = {
  t: TranslationSchema
}

export type ProjectMigration = (
  project: DeepPartialSchema<ProjectSchema>,
  context: ProjectMigrationContextSchema,
) => DeepPartialSchema<ProjectSchema>

export type GlobalSettingsMigration = (
  settings: DeepPartialSchema<GlobalSettingsSchema>,
  defaults: GlobalSettingsSchema,
) => DeepPartialSchema<GlobalSettingsSchema>

export type ProjectMigratorSchema = {
  project: (
    input: DeepPartialSchema<ProjectSchema>,
    context: ProjectMigrationContextSchema,
  ) => DeepPartialSchema<ProjectSchema>
  subProject: (
    input: DeepPartialSchema<SubProjectSchema>,
    context: ProjectMigrationContextSchema,
  ) => DeepPartialSchema<SubProjectSchema>
  colorSettings: (
    input: DeepPartialSchema<ColorSettingsSchema>,
    context: ProjectMigrationContextSchema,
  ) => DeepPartialSchema<ColorSettingsSchema>
  stitchingSettings: (
    input: DeepPartialSchema<StitchLineCommonConfigSchema>,
    context: ProjectMigrationContextSchema,
  ) => DeepPartialSchema<StitchLineCommonConfigSchema>
  rootPanel: (
    input: DeepPartialSchema<RootPanelSchema>,
    context: ProjectMigrationContextSchema,
  ) => DeepPartialSchema<RootPanelSchema>
  panel: (
    input: DeepPartialSchema<PanelSchema>,
    context: ProjectMigrationContextSchema,
  ) => DeepPartialSchema<PanelSchema>
  pocketCluster: (
    input: DeepPartialSchema<PocketClusterSchema>,
    context: ProjectMigrationContextSchema,
  ) => DeepPartialSchema<PocketClusterSchema>
  hole: (input: DeepPartialSchema<HoleSchema>, context: ProjectMigrationContextSchema) => DeepPartialSchema<HoleSchema>
  componentBoundsStitchLine: (
    input: DeepPartialSchema<ComponentBoundsStitchLineSchema>,
    context: ProjectMigrationContextSchema,
  ) => DeepPartialSchema<ComponentBoundsStitchLineSchema>
  pocketClusterStitchLine: (
    input: DeepPartialSchema<PocketClusterStitchLineSchema>,
    context: ProjectMigrationContextSchema,
  ) => DeepPartialSchema<PocketClusterStitchLineSchema>
}
