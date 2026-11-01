import { describe, expect, it } from 'vitest'
import type { ProjectSchema } from '../schemas/project'
import type { DeepPartialSchema } from '../schemas/utils'
import { d } from '../testData'
import { EN } from '../translations/en'
import { isDefined } from '../utils/isDefined'
import { defaultProjectMigrator } from './defaultProjectMigrator'
import { migratePocketOpenings } from './migratePocketOpenings'

const context = { t: EN }

const legacyFixture = () => {
  const root = d.rootPanel({ id: 'root', children: ['cluster'] })
  const cluster = d.pocketCluster({ id: 'cluster', children: ['t', 'front'] })
  const { openingId: _tOpeningId, ...t } = d.tPocket({ id: 't' })
  const { openingId: _frontOpeningId, ...front } = d.frontPocket({ id: 'front' })
  const {
    defaultPocketOpening: _defaultPocketOpening,
    pocketOpenings: _pocketOpenings,
    ...subProject
  } = d.subProject({ id: 'sub', root, components: [cluster] })
  const project: DeepPartialSchema<ProjectSchema> = {
    ...d.project({ id: 'project', subProjects: [] }),
    subProjects: [{ ...subProject, components: { ...subProject.components, t, front } }],
  }
  return project
}

describe('migratePocketOpenings', () => {
  it('creates a generated default and assigns missing pocket references without mutating the input', () => {
    const project = legacyFixture()
    const snapshot = structuredClone(project)
    const migrated = migratePocketOpenings(project, context)
    const subProject = migrated.subProjects?.[0]
    const defaultId = subProject?.defaultPocketOpening
    if (!isDefined(subProject) || !isDefined(defaultId)) {
      throw new Error('Missing migrated default')
    }
    expect(subProject.pocketOpenings?.[defaultId]).toEqual({
      type: 'straight',
      id: defaultId,
      name: EN.project.editors.enums.components.pocketOpening.straight,
    })
    expect(subProject.components?.t).toHaveProperty('openingId', defaultId)
    expect(subProject.components?.front).toHaveProperty('openingId', defaultId)
    expect(project).toEqual(snapshot)
    expect(migratePocketOpenings(migrated, context)).toEqual(migrated)
    expect(migratePocketOpenings(project, context).subProjects?.[0]?.defaultPocketOpening).not.toBe(defaultId)
  })

  it('preserves existing defaults, explicit pocket references and unused openings', () => {
    const opening = { id: 'unused', name: 'Unused', type: 'straight' } as const
    const subProject = d.subProject({
      id: 'sub',
      root: d.rootPanel({ id: 'root' }),
      components: [d.tPocket({ id: 't', openingId: opening.id })],
      pocketOpenings: [opening],
    })
    const project = d.project({ id: 'project', subProjects: [subProject] })
    expect(migratePocketOpenings(project, context)).toEqual(project)
  })

  it.each(['front-pocket', 't-pocket'] as const)(
    'leaves missing reference rejection to the default migrator for %s',
    (type) => {
      const component = type === 'front-pocket' ? d.frontPocket({ id: 'pocket' }) : d.tPocket({ id: 'pocket' })
      const project: DeepPartialSchema<ProjectSchema> = d.project({
        id: 'project',
        subProjects: [d.subProject({ id: 'sub', root: d.rootPanel({ id: 'root' }), components: [component] })],
      })
      const pocket = project.subProjects?.[0]?.components?.pocket
      if (!isDefined(pocket) || (pocket.type !== 'front-pocket' && pocket.type !== 't-pocket')) {
        throw new Error('Missing pocket')
      }
      delete pocket.openingId
      expect(() => defaultProjectMigrator(project, context)).toThrow('Expected openingId string')
    },
  )

  it('requires the default reference in the default migrator', () => {
    const project: DeepPartialSchema<ProjectSchema> = d.project({
      id: 'project',
      subProjects: [d.subProject({ id: 'sub', root: d.rootPanel({ id: 'root' }) })],
    })
    const subProject = project.subProjects?.[0]
    if (!isDefined(subProject)) {
      throw new Error('Missing subproject')
    }
    delete subProject.defaultPocketOpening
    expect(() => defaultProjectMigrator(project, context)).toThrow('Expected defaultPocketOpening string')
  })
})
