import { migrateProject } from '../migrations/migrateProject'
import type { ProjectMigrationContextSchema } from '../schemas/migration'
import type { ProjectSchema } from '../schemas/project'
import { assertAndPruneProjectSchema } from '../typia'

export const loadProjectFromContents = (contents: string, context: ProjectMigrationContextSchema): ProjectSchema => {
  const input: unknown = JSON.parse(contents)
  return assertAndPruneProjectSchema(migrateProject(input, context))
}
