import { VERSION } from '../../version'
import type { DeepPartial, ProjectMigration } from '../schemas/migration'
import type { ProjectSchema } from '../schemas/project'
import { defaultProjectMigrator } from './defaultProjectMigrator'
import { migrateVersionedObject } from './migrationUtils'

const MIGRATIONS: ProjectMigration[] = []

export const migrateProject = (input: unknown): DeepPartial<ProjectSchema> => {
  const migratedProject: DeepPartial<ProjectSchema> = migrateVersionedObject<ProjectSchema>(input, (project) =>
    MIGRATIONS.reduce((current, migrate): DeepPartial<ProjectSchema> => migrate(current), project),
  )

  return {
    ...defaultProjectMigrator(migratedProject),
    version: VERSION,
  }
}
