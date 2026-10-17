import { VERSION } from '../../version'
import type { DeepPartial, ProjectMigration, ProjectMigrationContextSchema } from '../schemas/migration'
import type { ProjectSchema } from '../schemas/project'
import { defaultProjectMigrator } from './defaultProjectMigrator'
import { migrateVersionedObject } from './migrationUtils'

const MIGRATIONS: ProjectMigration[] = []

export const migrateProject = (input: unknown, context: ProjectMigrationContextSchema): DeepPartial<ProjectSchema> => {
  const migratedProject: DeepPartial<ProjectSchema> = migrateVersionedObject<ProjectSchema>(input, (project) =>
    MIGRATIONS.reduce((current, migrate): DeepPartial<ProjectSchema> => migrate(current, context), project),
  )

  return {
    ...defaultProjectMigrator(migratedProject, context),
    version: VERSION,
  }
}
