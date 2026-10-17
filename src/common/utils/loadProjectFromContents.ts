import typia from 'typia'

import { migrateProject } from '../migrations/migrateProject'
import type { ProjectMigrationContextSchema } from '../schemas/migration'
import type { ProjectSchema } from '../schemas/project'

export const loadProjectFromContents = (contents: string, context: ProjectMigrationContextSchema): ProjectSchema => {
  const input: unknown = JSON.parse(contents)
  return typia.assert<ProjectSchema>(migrateProject(input, context))
}
