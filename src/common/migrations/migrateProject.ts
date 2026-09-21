import { VERSION } from '../../version'
import type { DeepPartial, ProjectMigration } from '../schemas/migration'
import type { ProjectSchema } from '../schemas/project'
import { isRecord } from '../utils/isRecord'
import { parseSemanticVersion } from '../utils/parseSemanticVersion'
import { defaultProjectMigrator } from './defaultProjectMigrator'

const MIGRATIONS: ProjectMigration[] = [defaultProjectMigrator]

export const migrateProject = (input: unknown): DeepPartial<ProjectSchema> => {
  if (!isRecord(input) || Array.isArray(input)) {
    throw new Error('Expected project object')
  }

  const project = input as DeepPartial<ProjectSchema>
  const comparison = compareProjectVersion(project.version)

  if (comparison > 0) {
    throw new Error('Project was created by a newer app version')
  }

  if (comparison === 0) {
    return project
  }

  return {
    ...migrateProjectToCurrentShape(project),
    version: VERSION,
  }
}

const migrateProjectToCurrentShape = (input: DeepPartial<ProjectSchema>): DeepPartial<ProjectSchema> => {
  return MIGRATIONS.reduce((project, migrate) => migrate(project), input)
}

const compareProjectVersion = (projectVersion: string | undefined): number => {
  if (typeof projectVersion === 'undefined') {
    return -1
  }

  const projectParts = parseSemanticVersion(projectVersion)
  const appParts = parseSemanticVersion(VERSION)

  if (projectParts.major !== appParts.major) {
    return projectParts.major - appParts.major
  }
  if (projectParts.minor !== appParts.minor) {
    return projectParts.minor - appParts.minor
  }
  if (projectParts.patch !== appParts.patch) {
    return projectParts.patch - appParts.patch
  }

  return 0
}
