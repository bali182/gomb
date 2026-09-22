import type { PanelSchema, PocketClusterSchema, RootPanelSchema } from './components'
import type { HoleSchema } from './hole'
import type { ProjectSchema } from './project'
import type { ColorSettingsSchema } from './settings'
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

export type ProjectMigration = (project: DeepPartial<ProjectSchema>) => DeepPartial<ProjectSchema>

export type ProjectMigratorSchema = {
  project: (input: DeepPartial<ProjectSchema>) => DeepPartial<ProjectSchema>
  subProject: (input: DeepPartial<SubProjectSchema>) => DeepPartial<SubProjectSchema>
  colorSettings: (input: DeepPartial<ColorSettingsSchema>) => DeepPartial<ColorSettingsSchema>
  stitchingSettings: (input: DeepPartial<StitchLineCommonConfigSchema>) => DeepPartial<StitchLineCommonConfigSchema>
  rootPanel: (input: DeepPartial<RootPanelSchema>) => DeepPartial<RootPanelSchema>
  panel: (input: DeepPartial<PanelSchema>) => DeepPartial<PanelSchema>
  pocketCluster: (input: DeepPartial<PocketClusterSchema>) => DeepPartial<PocketClusterSchema>
  hole: (input: DeepPartial<HoleSchema>) => DeepPartial<HoleSchema>
  componentBoundsStitchLine: (
    input: DeepPartial<ComponentBoundsStitchLineSchema>,
  ) => DeepPartial<ComponentBoundsStitchLineSchema>
  pocketClusterStitchLine: (
    input: DeepPartial<PocketClusterStitchLineSchema>,
  ) => DeepPartial<PocketClusterStitchLineSchema>
}
