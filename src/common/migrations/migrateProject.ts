import { VERSION } from '../../version'
import type { DeepPartial, ProjectMigration } from '../schemas/migration'
import type { ProjectSchema } from '../schemas/project'
import { defaultProjectMigrator } from './defaultProjectMigrator'
import { migrateVersionedObject } from './migrationUtils'

const MIGRATIONS: ProjectMigration[] = [defaultProjectMigrator]

export const migrateProject = (input: unknown): DeepPartial<ProjectSchema> => {
  return migrateVersionedObject<ProjectSchema>(input, migrateProjectToCurrentShape)
}

const migrateProjectToCurrentShape = (input: DeepPartial<ProjectSchema>): DeepPartial<ProjectSchema> => {
  return {
    ...MIGRATIONS.reduce((project, migrate): DeepPartial<ProjectSchema> => migrate(project), input),
    version: VERSION,
  }
}
