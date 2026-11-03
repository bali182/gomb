import { describe, expect, it } from 'vitest'
import { d } from '../../testData'
import { accessors } from './index'

const fixture = () =>
  d.subProject({
    id: 'sub',
    root: d.rootPanel({ id: 'root' }),
    pocketOpenings: [{ id: 'unused', name: 'Unused', type: 'straight' }],
  })

describe('PocketOpeningAccessor', () => {
  it('resolves default and unassigned openings', () => {
    const subProject = fixture()
    const accessor = accessors.subProject(subProject)
    expect(accessor.pocketOpening.defaultOpening()).toBe(subProject.pocketOpenings[subProject.defaultPocketOpening])
    expect(accessor.pocketOpening.byId('unused')).toBe(subProject.pocketOpenings.unused)
  })
  it('handles missing IDs through the existing strict and optional conventions', () => {
    const accessor = accessors.subProject(fixture())
    expect(accessor.optional.pocketOpening.byId('missing')).toBeUndefined()
    expect(accessor.optional.pocketOpening.byId('toString')).toBeUndefined()
    expect(() => accessor.pocketOpening.byId('missing')).toThrow('Missing pocket opening')
  })
  it('follows the stored default reference', () => {
    const subProject = { ...fixture(), defaultPocketOpening: 'unused' }
    expect(accessors.subProject(subProject).pocketOpening.defaultOpening().id).toBe('unused')
    const missingDefault = { ...subProject, defaultPocketOpening: 'missing' }
    const accessor = accessors.subProject(missingDefault)
    expect(accessor.optional.pocketOpening.defaultOpening()).toBeUndefined()
    expect(() => accessor.pocketOpening.defaultOpening()).toThrow('Missing default pocket opening')
  })
})
