import typia from 'typia'
import { describe, expect, it } from 'vitest'

import { VERSION } from '../../version'
import type { ProjectMigrationContextSchema } from '../schemas/migration'
import type { ProjectSchema } from '../schemas/project'
import type { DeepPartialSchema } from '../schemas/utils'
import { d } from '../testData'
import { EN } from '../translations/en'
import { createProject } from '../utils/createProject'
import { createSubProject } from '../utils/createSubProject'
import { isDefined } from '../utils/isDefined'
import { migrateProject } from './migrateProject'

const context: ProjectMigrationContextSchema = { t: EN }

const createProjectWithSubProject = (): ProjectSchema => {
  const project = createProject('Project')
  const subProject = createSubProject('Root', project.stitchingSettings)

  return {
    ...project,
    subProjects: [subProject],
  }
}

describe('migrateProject', () => {
  it('adds missing defaults to a versionless project', () => {
    const project = createProjectWithSubProject()
    const legacyProject: DeepPartialSchema<ProjectSchema> = structuredClone(project)
    const root = Object.values(legacyProject.subProjects?.[0]?.components ?? {})[0]

    if (!isDefined(root)) {
      throw new Error('Missing root component')
    }

    delete legacyProject.version
    delete legacyProject.colorSettings?.threadColor
    delete root.autoLayoutGap

    const migratedProject = migrateProject(legacyProject, context)

    expect(migratedProject.version).toBe(VERSION)
    expect(migratedProject.colorSettings?.threadColor).toBe(project.colorSettings.threadColor)
    expect(typia.is<ProjectSchema>(migratedProject)).toBe(true)
  })

  it('returns the same result when a versionless project is migrated repeatedly', () => {
    const project = createProjectWithSubProject()
    const legacyProject: DeepPartialSchema<ProjectSchema> = structuredClone(project)

    delete legacyProject.version

    expect(migrateProject(legacyProject, context)).toEqual(migrateProject(legacyProject, context))
  })

  it('does not create a project from an empty object', () => {
    expect(() => migrateProject({}, context)).toThrow()
  })

  it('does not migrate a component with a missing type', () => {
    const project = createProjectWithSubProject()
    const legacyProject: DeepPartialSchema<ProjectSchema> = structuredClone(project)
    const root = Object.values(legacyProject.subProjects?.[0]?.components ?? {})[0]

    if (!isDefined(root)) {
      throw new Error('Missing root component')
    }

    delete legacyProject.version
    delete root.type

    expect(() => migrateProject(legacyProject, context)).toThrow()
  })

  it('does not migrate a component bounds stitch line with an invalid target type', () => {
    const rootPanel = d.rootPanel({ id: 'root' })
    const stitchLine = d.componentBoundsStitchLine({
      id: 'stitch-line',
      targetId: rootPanel.id,
      targetType: 'invalid' as 'component',
    })
    const project = d.project({
      id: 'project',
      subProjects: [d.subProject({ id: 'sub-project', root: rootPanel, stitchLines: [stitchLine] })],
    })
    const legacyProject: DeepPartialSchema<ProjectSchema> = structuredClone(project)

    delete legacyProject.version

    expect(() => migrateProject(legacyProject, context)).toThrow()
  })

  it('migrates an older project version to the current version', () => {
    const project = createProjectWithSubProject()
    const legacyProject: DeepPartialSchema<ProjectSchema> = {
      ...project,
      version: '0.0.6',
    }

    expect(migrateProject(legacyProject, context).version).toBe(VERSION)
  })

  it('preserves project values with the current version', () => {
    const project = createProjectWithSubProject()

    expect(migrateProject(project, context)).toEqual(project)
  })

  it('adds missing card offsets with the current version while preserving existing values', () => {
    const root = d.rootPanel({ id: 'root' })
    const pocket = d.pocketCluster({ id: 'pocket', cardId: 'ID-1-landscape', pocketCount: 4 })
    const existingPocket = d.pocketCluster({ id: 'existing-pocket', cardCrossAxisOffset: -3, cardOpeningOffset: 7 })
    const project = d.project({
      id: 'project',
      subProjects: [d.subProject({ id: 'sub-project', root, components: [pocket, existingPocket] })],
    })
    const input: DeepPartialSchema<ProjectSchema> = structuredClone(project)
    const incompletePocket = input.subProjects?.[0]?.components?.[pocket.id]

    if (!isDefined(incompletePocket) || incompletePocket.type !== 'pocket-cluster') {
      throw new Error('Missing pocket cluster')
    }

    delete incompletePocket.cardCrossAxisOffset
    delete incompletePocket.cardOpeningOffset

    const migratedProject = migrateProject(input, context)

    expect(migratedProject).toEqual(project)
    expect(typia.is<ProjectSchema>(migratedProject)).toBe(true)
  })

  it('migrates projects with a different version', () => {
    const project = createProjectWithSubProject()
    const [major] = VERSION.split('.')
    const newerProject: DeepPartialSchema<ProjectSchema> = {
      ...project,
      version: `${Number(major) + 1}.0.0`,
    }

    expect(migrateProject(newerProject, context).version).toBe(VERSION)
  })
})
