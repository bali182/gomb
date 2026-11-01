import { describe, expect, it } from 'vitest'
import { defaultSlantedPocketOpening, defaultStitchingSettings } from '../../defaultStates'
import { getComputedSubProject } from '../../logic/getComputedSubProject'
import { d } from '../../testData'
import { accessors } from '../../utils/accessors'
import { comparators } from '../../utils/comparators'
import { createSubProject } from '../../utils/createSubProject'
import { cloneSubProject } from '../project/cloneSubProject'
import { deletePocketOpening } from './deletePocketOpening'
import { updatePocketOpening } from './updatePocketOpening'

const fixture = () => {
  const opening = {
    type: 'slanted' as const,
    ...defaultSlantedPocketOpening,
    id: 'shared',
    name: 'Slanted',
    offset: 1000,
  }
  const defaultOpening = { id: 'custom-default', name: 'Default', type: 'straight' } as const
  const root = d.rootPanel({ id: 'root', children: ['cluster'], width: 100, height: 100 })
  const cluster = d.pocketCluster({ id: 'cluster', children: ['t', 'front'] })
  const t = d.tPocket({ id: 't', openingId: opening.id })
  const front = d.frontPocket({ id: 'front', openingId: opening.id })
  const original = d.subProject({
    id: 'sub',
    root,
    components: [cluster, t, front],
    pocketOpenings: [opening, defaultOpening],
  })
  const subProject = {
    ...original,
    defaultPocketOpening: defaultOpening.id,
  }
  return {
    subProject,
    opening,
    defaultOpening,
    t,
    front,
    root,
    cluster,
    originalDefaultOpeningId: original.defaultPocketOpening,
  }
}

describe('standalone opening operations', () => {
  it('creates an independent straight default using the supplied name', () => {
    const first = createSubProject('Root', defaultStitchingSettings, 'Egyenes')
    const second = createSubProject('Root', defaultStitchingSettings, 'Straight')
    expect(first.defaultPocketOpening).not.toBe(second.defaultPocketOpening)
    expect(accessors.subProject(first).pocketOpening.defaultOpening()).toEqual({
      id: first.defaultPocketOpening,
      name: 'Egyenes',
      type: 'straight',
    })
    expect(first.pocketOpenings[first.defaultPocketOpening]).not.toBe(
      second.pocketOpenings[second.defaultPocketOpening],
    )
  })

  it('updates one shared definition while retaining pocket references and per-pocket correction', () => {
    const { subProject, opening, t, front } = fixture()
    const snapshot = structuredClone(subProject)
    const changedOpening = { ...opening, offset: 900 }
    const updated = updatePocketOpening(subProject, { opening: changedOpening })
    expect(updated.components).toBe(subProject.components)
    expect(accessors.subProject(updated).pocketOpening.byId(t.openingId)).toBe(changedOpening)
    expect(accessors.subProject(updated).pocketOpening.byId(front.openingId)).toBe(changedOpening)
    const computed = getComputedSubProject(updated, defaultStitchingSettings)
    const tLimits = computed.limits.components.t
    const frontLimits = computed.limits.components.front
    if (
      tLimits.type !== 't-pocket' ||
      frontLimits.type !== 'front-pocket' ||
      tLimits.opening.type !== 'slanted' ||
      frontLimits.opening.type !== 'slanted'
    ) {
      throw new Error('Unexpected limits')
    }
    expect(tLimits.opening.offset?.max?.value.toNumber()).toBeGreaterThan(0)
    expect(tLimits.opening.offset?.max?.value.lt(frontLimits.opening.offset?.max?.value ?? 0)).toBe(true)
    expect(updated.pocketOpenings.shared).toMatchObject({ offset: 900 })
    expect(comparators.subProject(subProject, updated)).toBe(false)
    expect(subProject).toEqual(snapshot)
  })

  it('rejects type changes and unknown openings', () => {
    const { subProject, opening } = fixture()
    expect(updatePocketOpening(subProject, { opening: { id: opening.id, name: opening.name, type: 'straight' } })).toBe(
      subProject,
    )
    expect(updatePocketOpening(subProject, { opening: { ...opening, id: 'missing' } })).toBe(subProject)
  })

  it('reassigns all users to the current default without changing unrelated components', () => {
    const { subProject, defaultOpening, root, cluster } = fixture()
    const snapshot = structuredClone(subProject)
    const updated = deletePocketOpening(subProject, { openingId: 'shared' })
    const accessor = accessors.subProject(updated)
    expect(accessor.component.tPocket('t').openingId).toBe(defaultOpening.id)
    expect(accessor.component.frontPocket('front').openingId).toBe(defaultOpening.id)
    expect(accessor.optional.pocketOpening.byId('shared')).toBeUndefined()
    expect(accessor.component.rootPanel()).toBe(root)
    expect(accessor.component.pocketCluster('cluster')).toBe(cluster)
    expect(subProject).toEqual(snapshot)
  })

  it('protects the current default rather than the initial default ID', () => {
    const { subProject, originalDefaultOpeningId } = fixture()
    expect(deletePocketOpening(subProject, { openingId: subProject.defaultPocketOpening })).toBe(subProject)
    expect(deletePocketOpening(subProject, { openingId: 'missing' })).toBe(subProject)
    expect(deletePocketOpening(subProject, { openingId: originalDefaultOpeningId }).pocketOpenings).not.toHaveProperty(
      originalDefaultOpeningId,
    )
  })

  it('preserves the components record when deleting an unused opening', () => {
    const { subProject, originalDefaultOpeningId } = fixture()
    const updated = deletePocketOpening(subProject, { openingId: originalDefaultOpeningId })
    expect(updated.components).toBe(subProject.components)
    expect(updated.pocketOpenings).not.toHaveProperty(originalDefaultOpeningId)
    expect(subProject.pocketOpenings).toHaveProperty(originalDefaultOpeningId)
  })

  it('retains unused definitions and the default reference when duplicating a subproject', () => {
    const { subProject } = fixture()
    const unused = { type: 'slanted' as const, ...defaultSlantedPocketOpening, id: 'unused', name: 'Unused' }
    const source = { ...subProject, pocketOpenings: { ...subProject.pocketOpenings, unused } }
    let counter = 0
    const result = cloneSubProject(d.project({ id: 'project', subProjects: [source] }), {
      subProject: source,
      getUnusedId: () => `copy-${++counter}`,
    })
    const cloned = result.subProjects[1]
    expect(cloned.defaultPocketOpening).toBe(source.defaultPocketOpening)
    expect(cloned.pocketOpenings).toEqual(source.pocketOpenings)
    expect(cloned.pocketOpenings).not.toBe(source.pocketOpenings)
    expect(cloned.pocketOpenings.unused).not.toBe(unused)
    for (const pocket of Object.values(cloned.components)) {
      if (pocket.type === 't-pocket' || pocket.type === 'front-pocket') {
        expect(pocket.openingId).toBe('shared')
      }
    }
  })
})
