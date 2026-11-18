import { describe, expect, it } from 'vitest'
import { defaultSlantedPocketOpening } from '../../defaultStates'
import type { SlantedPocketOpeningSchema, StraightPocketOpeningSchema } from '../../schemas/pocketOpening'
import { d } from '../../testData'
import { accessors } from '../../utils/accessors'
import { comparators } from '../../utils/comparators'
import { createBaseOperationParams } from './testUtils'
import { updatePocketOpening } from './updatePocketOpening'

const fixture = () => {
  const opening: SlantedPocketOpeningSchema = {
    type: 'slanted',
    ...defaultSlantedPocketOpening,
    id: 'shared',
    name: 'Slanted',
    slantOffset: 1000,
  }
  const defaultOpening: StraightPocketOpeningSchema = { id: 'custom-default', name: 'Default', type: 'straight' }
  const root = d.rootPanel({ id: 'root', width: 100, height: 100 })
  const cluster = d.pocketCluster({ id: 'cluster', children: ['t', 'front'] })
  const t = d.tPocket({ id: 't', openingId: opening.id })
  const front = d.frontPocket({ id: 'front', openingId: opening.id })
  const original = d.subProject({
    frontFace: d.rootPanelFace({ id: 'root-front', children: ['cluster'] }),
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

describe('updatePocketOpening', () => {
  it('updates one shared definition while retaining pocket references', () => {
    const { subProject, opening, t, front } = fixture()
    const snapshot = structuredClone(subProject)
    const changedOpening: SlantedPocketOpeningSchema = { ...opening, slantOffset: 900 }
    const updated = updatePocketOpening(createBaseOperationParams(subProject), { opening: changedOpening })
    expect(updated.components).toBe(subProject.components)
    expect(accessors.subProject(updated).pocketOpening.byId(t.openingId)).toBe(changedOpening)
    expect(accessors.subProject(updated).pocketOpening.byId(front.openingId)).toBe(changedOpening)
    expect(updated.pocketOpenings.shared).toMatchObject({ slantOffset: 900 })
    expect(comparators.subProject(subProject, updated)).toBe(false)
    expect(subProject).toEqual(snapshot)
  })

  it('rejects type changes and unknown openings', () => {
    const { subProject, opening } = fixture()
    expect(
      updatePocketOpening(createBaseOperationParams(subProject), {
        opening: { id: opening.id, name: opening.name, type: 'straight' },
      }),
    ).toBe(subProject)
    expect(updatePocketOpening(createBaseOperationParams(subProject), { opening: { ...opening, id: 'missing' } })).toBe(
      subProject,
    )
  })
})
