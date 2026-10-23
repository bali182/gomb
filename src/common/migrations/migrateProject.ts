import { VERSION } from '../../version'
import type { ProjectMigration, ProjectMigrationContextSchema } from '../schemas/migration'
import type { ProjectSchema } from '../schemas/project'
import type { DeepPartialSchema } from '../schemas/utils'
import { defaultProjectMigrator } from './defaultProjectMigrator'
import { migratePocketComponents } from './migratePocketComponents'
import { migrateVersionedObject } from './migrationUtils'

const MIGRATIONS: ProjectMigration[] = [migratePocketComponents]

export const migrateProject = (
  input: unknown,
  context: ProjectMigrationContextSchema,
): DeepPartialSchema<ProjectSchema> => {
  const migratedProject: DeepPartialSchema<ProjectSchema> = migrateVersionedObject<ProjectSchema>(input, (project) =>
    MIGRATIONS.reduce((current, migrate): DeepPartialSchema<ProjectSchema> => migrate(current, context), project),
  )

  return {
    ...defaultProjectMigrator(migratedProject, context),
    version: VERSION,
  }
}
