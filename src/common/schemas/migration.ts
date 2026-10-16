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

export type DeepPartial<T> = T extends readonly (infer Item)[]
  ? DeepPartial<Item>[]
  : T extends object
    ? { [Property in keyof T]?: DeepPartial<T[Property]> }
    : T

export type ProjectMigrationContextSchema = {
  t: TranslationSchema
}

export type ProjectMigration = (
  project: DeepPartial<ProjectSchema>,
  context: ProjectMigrationContextSchema,
) => DeepPartial<ProjectSchema>

export type GlobalSettingsMigration = (
  settings: DeepPartial<GlobalSettingsSchema>,
  defaults: GlobalSettingsSchema,
) => DeepPartial<GlobalSettingsSchema>

export type ProjectMigratorSchema = {
  project: (input: DeepPartial<ProjectSchema>, context: ProjectMigrationContextSchema) => DeepPartial<ProjectSchema>
  subProject: (
    input: DeepPartial<SubProjectSchema>,
    context: ProjectMigrationContextSchema,
  ) => DeepPartial<SubProjectSchema>
  colorSettings: (
    input: DeepPartial<ColorSettingsSchema>,
    context: ProjectMigrationContextSchema,
  ) => DeepPartial<ColorSettingsSchema>
  stitchingSettings: (
    input: DeepPartial<StitchLineCommonConfigSchema>,
    context: ProjectMigrationContextSchema,
  ) => DeepPartial<StitchLineCommonConfigSchema>
  rootPanel: (
    input: DeepPartial<RootPanelSchema>,
    context: ProjectMigrationContextSchema,
  ) => DeepPartial<RootPanelSchema>
  panel: (input: DeepPartial<PanelSchema>, context: ProjectMigrationContextSchema) => DeepPartial<PanelSchema>
  pocketCluster: (
    input: DeepPartial<PocketClusterSchema>,
    context: ProjectMigrationContextSchema,
  ) => DeepPartial<PocketClusterSchema>
  hole: (input: DeepPartial<HoleSchema>, context: ProjectMigrationContextSchema) => DeepPartial<HoleSchema>
  componentBoundsStitchLine: (
    input: DeepPartial<ComponentBoundsStitchLineSchema>,
    context: ProjectMigrationContextSchema,
  ) => DeepPartial<ComponentBoundsStitchLineSchema>
  pocketClusterStitchLine: (
    input: DeepPartial<PocketClusterStitchLineSchema>,
    context: ProjectMigrationContextSchema,
  ) => DeepPartial<PocketClusterStitchLineSchema>
}
