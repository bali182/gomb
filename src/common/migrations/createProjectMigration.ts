import type { ComponentSchema } from '../schemas/components'
import type { HoleSchema } from '../schemas/hole'
import type { ProjectMigration, ProjectMigrationContextSchema, ProjectMigratorSchema } from '../schemas/migration'
import type { PocketOpeningSchema } from '../schemas/pocketOpening'
import type { ProjectSchema } from '../schemas/project'
import type { StitchLineSchema } from '../schemas/stitching'
import type { SubProjectSchema } from '../schemas/subProject'
import type { DeepPartialSchema } from '../schemas/utils'
import { m } from './migrationUtils'

export const createProjectMigration = (migrator: ProjectMigratorSchema): ProjectMigration => {
  return (
    project: DeepPartialSchema<ProjectSchema>,
    context: ProjectMigrationContextSchema,
  ): DeepPartialSchema<ProjectSchema> => {
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
  subProject: DeepPartialSchema<SubProjectSchema>,
  context: ProjectMigrationContextSchema,
): DeepPartialSchema<SubProjectSchema> => {
  const migratedSubProject = migrator.subProject(m.requireObject(subProject), context)
  const pocketOpenings = Object.fromEntries(
    Object.entries(
      m.requireObjectField<SubProjectSchema, Record<string, PocketOpeningSchema>>(migratedSubProject, 'pocketOpenings'),
    ).map(([id, opening]) => [
      id,
      migratePocketOpening(migrator, m.requireObject<PocketOpeningSchema>(opening), context),
    ]),
  )
  const components = Object.fromEntries(
    Object.entries(m.requireObject(migratedSubProject.components)).map(([id, component]) => [
      id,
      migrateComponent(migrator, component as DeepPartialSchema<ComponentSchema>, context),
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
    pocketOpenings,
    components,
    holes,
    stitchLines,
  }
}

const migratePocketOpening = (
  migrator: ProjectMigratorSchema,
  opening: DeepPartialSchema<PocketOpeningSchema>,
  context: ProjectMigrationContextSchema,
): DeepPartialSchema<PocketOpeningSchema> => {
  switch (opening.type) {
    case 'straight':
      return migrator.straightPocketOpening(opening, context)
    case 'recessed':
      return migrator.recessedPocketOpening(opening, context)
    case 'slanted':
      return migrator.slantedPocketOpening(opening, context)
    case 'optical-illusion':
      return migrator.opticalIllusionPocketOpening(opening, context)
    default:
      throw new Error('Unknown pocket opening type')
  }
}

const migrateComponent = (
  migrator: ProjectMigratorSchema,
  component: DeepPartialSchema<ComponentSchema>,
  context: ProjectMigrationContextSchema,
): DeepPartialSchema<ComponentSchema> => {
  switch (component.type) {
    case 'front-pocket':
      return migrator.frontPocket(component, context)
    case 't-pocket':
      return migrator.tPocket(component, context)
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
  stitchLine: DeepPartialSchema<StitchLineSchema>,
  context: ProjectMigrationContextSchema,
): DeepPartialSchema<StitchLineSchema> => {
  switch (stitchLine.type) {
    case 'component-bounds-stitch-line':
      return migrator.componentBoundsStitchLine(stitchLine, context)
    case 't-pocket-stitch-line':
      return migrator.tPocketStitchLine(stitchLine, context)
    default:
      throw new Error('Unknown stitch line type')
  }
}
