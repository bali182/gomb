import type { ComponentSchema } from '../schemas/components'
import type { HoleSchema } from '../schemas/hole'
import type {
  DeepPartial,
  ProjectMigration,
  ProjectMigrationContextSchema,
  ProjectMigratorSchema,
} from '../schemas/migration'
import type { ProjectSchema } from '../schemas/project'
import type { StitchLineSchema } from '../schemas/stitching'
import type { SubProjectSchema } from '../schemas/subProject'
import { m } from './migrationUtils'

export const createProjectMigration = (migrator: ProjectMigratorSchema): ProjectMigration => {
  return (project: DeepPartial<ProjectSchema>, context: ProjectMigrationContextSchema): DeepPartial<ProjectSchema> => {
    const migratedProject = migrator.project(project, context)
    const migratedColorSettings = migrator.colorSettings(m.requireObject(migratedProject.colorSettings), context)
    const migratedStitchingSettings = migrator.stitchingSettings(
      m.requireObject(migratedProject.stitchingSettings),
      context,
    )
    const subProjects = m
      .requireArray<ProjectSchema, SubProjectSchema>(migratedProject, 'subProjects')
      .map((subProject) => migrateSubProject(migrator, subProject, context))

    return {
      ...migratedProject,
      colorSettings: migratedColorSettings,
      stitchingSettings: migratedStitchingSettings,
      subProjects,
    }
  }
}

const migrateSubProject = (
  migrator: ProjectMigratorSchema,
  subProject: DeepPartial<SubProjectSchema>,
  context: ProjectMigrationContextSchema,
): DeepPartial<SubProjectSchema> => {
  const migratedSubProject = migrator.subProject(m.requireObject(subProject), context)
  const components = Object.fromEntries(
    Object.entries(m.requireObject(migratedSubProject.components)).map(([id, component]) => [
      id,
      migrateComponent(migrator, component as DeepPartial<ComponentSchema>, context),
    ]),
  )
  const holes = m
    .requireArray<SubProjectSchema, HoleSchema>(migratedSubProject, 'holes')
    .map((hole) => migrator.hole(m.requireObject(hole), context))
  const stitchLines = m
    .requireArray<SubProjectSchema, StitchLineSchema>(migratedSubProject, 'stitchLines')
    .map((stitchLine) => migrateStitchLine(migrator, stitchLine, context))

  return {
    ...migratedSubProject,
    components,
    holes,
    stitchLines,
  }
}

const migrateComponent = (
  migrator: ProjectMigratorSchema,
  component: DeepPartial<ComponentSchema>,
  context: ProjectMigrationContextSchema,
): DeepPartial<ComponentSchema> => {
  switch (component.type) {
    case 'root-panel':
      return migrator.rootPanel(component, context)
    case 'panel':
      return migrator.panel(component, context)
    case 'pocket-cluster':
      return migrator.pocketCluster(component, context)
    default:
      throw new Error('Unknown component type')
  }
}

const migrateStitchLine = (
  migrator: ProjectMigratorSchema,
  stitchLine: DeepPartial<StitchLineSchema>,
  context: ProjectMigrationContextSchema,
): DeepPartial<StitchLineSchema> => {
  switch (stitchLine.type) {
    case 'component-bounds-stitch-line':
      return migrator.componentBoundsStitchLine(stitchLine, context)
    case 'pocket-cluster-stitch-line':
      return migrator.pocketClusterStitchLine(stitchLine, context)
    default:
      throw new Error('Unknown stitch line type')
  }
}
