import { describe, expect, it } from 'vitest'
import { d } from '../../testData'
import { accessors } from '../../utils/accessors'
import { narrowers } from '../../utils/narrowers'
import { attachPocketOpening } from './attachPocketOpening'
import { createBaseOperationParams } from './testUtils'

const fixture = () =>
  d.subProject({
    id: 'sub',
    root: d.rootPanel({ id: 'root', frontFaceId: 'front-face', backFaceId: 'back-face' }),
    frontFace: d.rootPanelFace({ id: 'front-face', children: ['panel', 'empty'] }),
    backFace: d.rootPanelFace({ id: 'back-face', children: ['back-cluster'] }),
    components: [
      d.panel({ id: 'panel', children: ['cluster'] }),
      d.panel({ id: 'empty' }),
      d.pocketCluster({ id: 'cluster', children: ['front', 't'] }),
      d.frontPocket({ id: 'front', openingId: 'old', children: ['guide'] }),
      d.tPocket({ id: 't', openingId: 'replacement' }),
      d.guide({ id: 'guide', children: ['nested-cluster'] }),
      d.pocketCluster({ id: 'nested-cluster', children: ['nested-front', 'nested-t'] }),
      d.frontPocket({ id: 'nested-front', openingId: 'old' }),
      d.tPocket({ id: 'nested-t', openingId: 'old' }),
      d.pocketCluster({ id: 'back-cluster', children: ['back-front'] }),
      d.frontPocket({ id: 'back-front', openingId: 'old' }),
    ],
    pocketOpenings: [
      { id: 'old', name: 'Old', type: 'straight' },
      { id: 'replacement', name: 'Replacement', type: 'straight' },
    ],
  })

describe('attachPocketOpening', () => {
  it('updates pockets at every depth in the target subtree and preserves unrelated references and the input', () => {
    const source = fixture()
    const snapshot = structuredClone(source)
    const result = attachPocketOpening(createBaseOperationParams(source), {
      openingId: 'replacement',
      componentId: 'panel',
    })
    const accessor = accessors.subProject(result)
    for (const id of ['front', 't', 'nested-front', 'nested-t']) {
      expect(narrowers.assert.pocket(accessor.component.byId(id)).openingId).toBe('replacement')
    }
    expect(result.components.t).toBe(source.components.t)
    for (const id of [
      'root',
      'front-face',
      'back-face',
      'panel',
      'cluster',
      'guide',
      'nested-cluster',
      'empty',
      'back-cluster',
      'back-front',
    ]) {
      expect(result.components[id]).toBe(source.components[id])
    }
    expect(result.pocketOpenings).toBe(source.pocketOpenings)
    expect(result.holes).toBe(source.holes)
    expect(result.stitchLines).toBe(source.stitchLines)
    expect(result.bindings).toBe(source.bindings)
    expect(result.defaultPocketOpening).toBe(source.defaultPocketOpening)
    expect(source).toEqual(snapshot)
  })

  it('updates only the directly targeted pocket and preserves its descendants', () => {
    const source = fixture()
    const result = attachPocketOpening(createBaseOperationParams(source), {
      openingId: 'replacement',
      componentId: 'front',
    })
    const accessor = accessors.subProject(result)
    expect(accessor.component.frontPocket('front').openingId).toBe('replacement')
    expect(result.components.guide).toBe(source.components.guide)
    expect(result.components['nested-cluster']).toBe(source.components['nested-cluster'])
    expect(result.components['nested-front']).toBe(source.components['nested-front'])
    expect(result.components['nested-t']).toBe(source.components['nested-t'])
    expect(result.components.t).toBe(source.components.t)
    expect(result.components['back-front']).toBe(source.components['back-front'])
  })

  it('updates a directly targeted t-pocket', () => {
    const source = fixture()
    const result = attachPocketOpening(createBaseOperationParams(source), {
      openingId: 'replacement',
      componentId: 'nested-t',
    })
    expect(accessors.subProject(result).component.tPocket('nested-t').openingId).toBe('replacement')
    expect(result.components['nested-front']).toBe(source.components['nested-front'])
  })

  it('returns the original snapshot when the directly targeted pocket already uses the opening', () => {
    const source = fixture()
    expect(
      attachPocketOpening(createBaseOperationParams(source), {
        openingId: 'old',
        componentId: 'front',
      }),
    ).toBe(source)
  })

  it('updates both faces when targeting the root panel', () => {
    const source = fixture()
    const result = attachPocketOpening(createBaseOperationParams(source), {
      openingId: 'replacement',
      componentId: 'root',
    })
    const accessor = accessors.subProject(result)
    expect(accessor.component.frontPocket('front').openingId).toBe('replacement')
    expect(accessor.component.tPocket('nested-t').openingId).toBe('replacement')
    expect(accessor.component.frontPocket('back-front').openingId).toBe('replacement')
  })

  it('limits changes to the targeted root panel face', () => {
    const source = fixture()
    const result = attachPocketOpening(createBaseOperationParams(source), {
      openingId: 'replacement',
      componentId: 'front-face',
    })
    expect(accessors.subProject(result).component.frontPocket('nested-front').openingId).toBe('replacement')
    expect(result.components['back-front']).toBe(source.components['back-front'])
  })

  it('returns the original snapshot when all targeted pockets already use the opening', () => {
    const updated = attachPocketOpening(createBaseOperationParams(fixture()), {
      openingId: 'replacement',
      componentId: 'panel',
    })
    expect(
      attachPocketOpening(createBaseOperationParams(updated), {
        openingId: 'replacement',
        componentId: 'panel',
      }),
    ).toBe(updated)
  })

  it('returns the original snapshot for a subtree without pockets', () => {
    const source = fixture()
    expect(
      attachPocketOpening(createBaseOperationParams(source), {
        openingId: 'replacement',
        componentId: 'empty',
      }),
    ).toBe(source)
  })

  it.each([
    { openingId: 'missing', componentId: 'panel' },
    { openingId: 'replacement', componentId: 'missing' },
  ])('returns the original snapshot for unknown IDs: %o', (params) => {
    const source = fixture()
    expect(attachPocketOpening(createBaseOperationParams(source), params)).toBe(source)
  })
})
