import typia from 'typia'

import { migrateProject } from '../migrations/migrateProject'
import type { ProjectSchema } from '../schemas/project'

export const parseProjectFileContents = (contents: string): ProjectSchema => {
  const input: unknown = JSON.parse(contents)
  return typia.assert<ProjectSchema>(migrateProject(input))
}
