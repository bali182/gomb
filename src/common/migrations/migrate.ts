import type { ComponentSchema } from '../schemas/components'
import type { HoleSchema } from '../schemas/hole'
import type { DeepPartial, ProjectMigration, ProjectMigratorSchema } from '../schemas/migration'
import type { ProjectSchema } from '../schemas/project'
import type { StitchLineSchema } from '../schemas/stitching'
import type { SubProjectSchema } from '../schemas/subProject'
import { m } from './migrationUtils'

export const migrate = (migrator: ProjectMigratorSchema): ProjectMigration => {
  return (project: DeepPartial<ProjectSchema>): DeepPartial<ProjectSchema> => {
    const migratedProject = migrator.project(project)
    const migratedColorSettings = migrator.colorSettings(m.requireObject(migratedProject.colorSettings))
    const migratedStitchingSettings = migrator.stitchingSettings(m.requireObject(migratedProject.stitchingSettings))
    const subProjects = m
      .requireArray<ProjectSchema, SubProjectSchema>(migratedProject, 'subProjects')
      .map((subProject) => migrateSubProject(migrator, subProject))

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
): DeepPartial<SubProjectSchema> => {
  const migratedSubProject = migrator.subProject(m.requireObject(subProject))
  const components = Object.fromEntries(
    Object.entries(m.requireObject(migratedSubProject.components)).map(([id, component]) => [
      id,
      migrateComponent(migrator, component as DeepPartial<ComponentSchema>),
    ]),
  )
  const holes = m
    .requireArray<SubProjectSchema, HoleSchema>(migratedSubProject, 'holes')
    .map((hole) => migrator.hole(m.requireObject(hole)))
  const stitchLines = m
    .requireArray<SubProjectSchema, StitchLineSchema>(migratedSubProject, 'stitchLines')
    .map((stitchLine) => migrateStitchLine(migrator, stitchLine))

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
): DeepPartial<ComponentSchema> => {
  switch (component.type) {
    case 'root-panel':
      return migrator.rootPanel(component)
    case 'panel':
      return migrator.panel(component)
    case 'pocket-cluster':
      return migrator.pocketCluster(component)
    default:
      throw new Error('Unknown component type')
  }
}

const migrateStitchLine = (
  migrator: ProjectMigratorSchema,
  stitchLine: DeepPartial<StitchLineSchema>,
): DeepPartial<StitchLineSchema> => {
  switch (stitchLine.type) {
    case 'component-bounds-stitch-line':
      return migrator.componentBoundsStitchLine(stitchLine)
    case 'pocket-cluster-stitch-line':
      return migrator.pocketClusterStitchLine(stitchLine)
    default:
      throw new Error('Unknown stitch line type')
  }
}
