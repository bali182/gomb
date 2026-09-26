import typia from 'typia'
import { describe, expect, it } from 'vitest'

import { VERSION } from '../../version'
import type { DeepPartial } from '../schemas/migration'
import type { ProjectSchema } from '../schemas/project'
import { d } from '../testData'
import { createProject } from '../utils/createProject'
import { createSubProject } from '../utils/createSubProject'
import { isDefined } from '../utils/isDefined'
import { migrateProject } from './migrateProject'

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
    const legacyProject: DeepPartial<ProjectSchema> = structuredClone(project)
    const root = Object.values(legacyProject.subProjects?.[0]?.components ?? {})[0]

    if (!isDefined(root)) {
      throw new Error('Missing root component')
    }

    delete legacyProject.version
    delete legacyProject.colorSettings?.threadColor
    delete root.autoLayoutGap

    const migratedProject = migrateProject(legacyProject)

    expect(migratedProject.version).toBe(VERSION)
    expect(migratedProject.colorSettings?.threadColor).toBe(project.colorSettings.threadColor)
    expect(typia.is<ProjectSchema>(migratedProject)).toBe(true)
  })

  it('returns the same result when a versionless project is migrated repeatedly', () => {
    const project = createProjectWithSubProject()
    const legacyProject: DeepPartial<ProjectSchema> = structuredClone(project)

    delete legacyProject.version

    expect(migrateProject(legacyProject)).toEqual(migrateProject(legacyProject))
  })

  it('does not create a project from an empty object', () => {
    expect(() => migrateProject({})).toThrow()
  })

  it('does not migrate a component with a missing type', () => {
    const project = createProjectWithSubProject()
    const legacyProject: DeepPartial<ProjectSchema> = structuredClone(project)
    const root = Object.values(legacyProject.subProjects?.[0]?.components ?? {})[0]

    if (!isDefined(root)) {
      throw new Error('Missing root component')
    }

    delete legacyProject.version
    delete root.type

    expect(() => migrateProject(legacyProject)).toThrow()
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
    const legacyProject: DeepPartial<ProjectSchema> = structuredClone(project)

    delete legacyProject.version

    expect(() => migrateProject(legacyProject)).toThrow()
  })

  it('migrates an older project version to the current version', () => {
    const project = createProjectWithSubProject()
    const legacyProject: DeepPartial<ProjectSchema> = {
      ...project,
      version: '0.0.6',
    }

    expect(migrateProject(legacyProject).version).toBe(VERSION)
  })

  it('does not migrate a project with the current version', () => {
    const project = createProjectWithSubProject()

    expect(migrateProject(project)).toBe(project)
  })

  it('migrates projects with a different version', () => {
    const project = createProjectWithSubProject()
    const [major] = VERSION.split('.')
    const newerProject: DeepPartial<ProjectSchema> = {
      ...project,
      version: `${Number(major) + 1}.0.0`,
    }

    expect(migrateProject(newerProject).version).toBe(VERSION)
  })
})
