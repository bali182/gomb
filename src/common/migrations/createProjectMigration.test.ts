import { describe, expect, it, vi } from 'vitest'
import { createPocketOpening } from '../operations/subProject/utils/createPocketOpening'
import type { ProjectMigratorSchema } from '../schemas/migration'
import type { PocketOpeningSchema } from '../schemas/pocketOpening'
import { d } from '../testData'
import { EN } from '../translations/en'
import { createProjectMigration } from './createProjectMigration'

const createMigrator = (): ProjectMigratorSchema => ({
  project: (input) => input,
  subProject: (input) => input,
  colorSettings: (input) => input,
  stitchingSettings: (input) => input,
  rootPanel: (input) => input,
  panel: (input) => input,
  pocketCluster: (input) => input,
  frontPocket: (input) => input,
  tPocket: (input) => input,
  straightPocketOpening: (input) => input,
  recessedPocketOpening: (input) => input,
  slantedPocketOpening: (input) => input,
  opticalIllusionPocketOpening: (input) => input,
  hole: (input) => input,
  componentBoundsStitchLine: (input) => input,
  tPocketStitchLine: (input) => input,
})

const fixture = () => {
  const types: PocketOpeningSchema['type'][] = ['straight', 'recessed', 'slanted', 'optical-illusion']
  const openings = types.map((type) => createPocketOpening({ type, id: type, name: type }))
  const subProject = d.subProject({ id: 'sub', root: d.rootPanel({ id: 'root' }), pocketOpenings: openings })
  return { project: d.project({ id: 'project', subProjects: [subProject] }), openings }
}

const context = { t: EN }

describe('createProjectMigration opening traversal', () => {
  it('dispatches every opening to its typed callback with the existing context', () => {
    const migrator = createMigrator()
    const callbacks = [
      vi.spyOn(migrator, 'straightPocketOpening'),
      vi.spyOn(migrator, 'recessedPocketOpening'),
      vi.spyOn(migrator, 'slantedPocketOpening'),
      vi.spyOn(migrator, 'opticalIllusionPocketOpening'),
    ]
    const { project, openings } = fixture()
    createProjectMigration(migrator)(project, context)
    for (const [index, callback] of callbacks.entries()) {
      expect(callback).toHaveBeenCalledWith(openings[index], context)
    }
  })

  it('retains record keys and returns the typed callback result without mutating the input', () => {
    const migrator = createMigrator()
    vi.spyOn(migrator, 'recessedPocketOpening').mockImplementation((input) => ({ ...input, depth: 27 }))
    const { project } = fixture()
    const snapshot = structuredClone(project)
    const result = createProjectMigration(migrator)(project, context)
    expect(result.subProjects?.[0]?.pocketOpenings?.recessed).toMatchObject({ id: 'recessed', depth: 27 })
    expect(project).toEqual(snapshot)
  })

  it.each(['missing', 'unknown'])('rejects a %s opening type', (kind) => {
    const { project } = fixture()
    const opening = project.subProjects[0].pocketOpenings.recessed
    if (kind === 'missing') {
      Reflect.deleteProperty(opening, 'type')
    } else {
      Reflect.set(opening, 'type', 'unknown')
    }
    expect(() => createProjectMigration(createMigrator())(project, context)).toThrow('Unknown pocket opening type')
  })
})
