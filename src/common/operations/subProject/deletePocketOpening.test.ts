import { describe, expect, it } from 'vitest'
import { defaultSlantedPocketOpening } from '../../defaultStates'
import { d } from '../../testData'
import { accessors } from '../../utils/accessors'
import { deletePocketOpening } from './deletePocketOpening'
import { createBaseOperationParams } from './testUtils'

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

describe('deletePocketOpening', () => {
  it('reassigns all users to the current default without changing unrelated components', () => {
    const { subProject, defaultOpening, root, cluster } = fixture()
    const snapshot = structuredClone(subProject)
    const updated = deletePocketOpening(createBaseOperationParams(subProject), { id: 'shared' })
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
    expect(deletePocketOpening(createBaseOperationParams(subProject), { id: subProject.defaultPocketOpening })).toBe(
      subProject,
    )
    expect(deletePocketOpening(createBaseOperationParams(subProject), { id: 'missing' })).toBe(subProject)
    expect(
      deletePocketOpening(createBaseOperationParams(subProject), { id: originalDefaultOpeningId }).pocketOpenings,
    ).not.toHaveProperty(originalDefaultOpeningId)
  })

  it('preserves the components record when deleting an unused opening', () => {
    const { subProject, originalDefaultOpeningId } = fixture()
    const updated = deletePocketOpening(createBaseOperationParams(subProject), { id: originalDefaultOpeningId })
    expect(updated.components).toBe(subProject.components)
    expect(updated.pocketOpenings).not.toHaveProperty(originalDefaultOpeningId)
    expect(subProject.pocketOpenings).toHaveProperty(originalDefaultOpeningId)
  })
})
