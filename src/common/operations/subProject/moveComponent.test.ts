import { describe, expect, it } from 'vitest'
import { d } from '../../testData'
import { moveComponent } from './moveComponent'
import { createBaseOperationParams } from './testUtils'

const fixture = () => {
  const first = d.pocketCluster({ id: 'first', children: ['a', 'front-a'] })
  const second = d.pocketCluster({ id: 'second', children: ['b', 'front-b'] })
  return d.subProject({
    id: 'sub',
    root: d.rootPanel({ id: 'root', children: ['first', 'second'] }),
    components: [
      first,
      second,
      d.tPocket({ id: 'a' }),
      d.tPocket({ id: 'b' }),
      d.frontPocket({ id: 'front-a', children: ['child'] }),
      d.frontPocket({ id: 'front-b' }),
      d.panel({ id: 'child' }),
    ],
  })
}

describe('moveComponent', () => {
  it('moves T-pockets between clusters and keeps each front last', () => {
    const source = fixture()
    const moved = moveComponent(createBaseOperationParams(source), {
      id: 'a',
      targetParentId: 'second',
      beforeComponentId: 'b',
    })
    expect(moved.components.first.children).toEqual(['front-a'])
    expect(moved.components.second.children).toEqual(['a', 'b', 'front-b'])
    const reordered = moveComponent(createBaseOperationParams(moved), {
      id: 'a',
      targetParentId: 'second',
      beforeComponentId: 'front-b',
    })
    expect(reordered.components.second.children).toEqual(['b', 'a', 'front-b'])
  })

  it('rejects moving front pockets and T-pockets to incompatible parents without changing the source', () => {
    const source = fixture()
    const snapshot = structuredClone(source)
    expect(
      moveComponent(createBaseOperationParams(source), {
        id: 'front-a',
        targetParentId: 'second',
        beforeComponentId: undefined,
      }),
    ).toBe(source)
    expect(
      moveComponent(createBaseOperationParams(source), {
        id: 'a',
        targetParentId: 'root',
        beforeComponentId: undefined,
      }),
    ).toBe(source)
    expect(source).toEqual(snapshot)
  })

  it('keeps a lone front pocket immovable', () => {
    const source = fixture()
    source.components.first.children = ['front-a']
    delete source.components.a
    source.components.empty = d.pocketCluster({ id: 'empty' })
    source.components.root.children.push('empty')
    const snapshot = structuredClone(source)
    expect(
      moveComponent(createBaseOperationParams(source), {
        id: 'front-a',
        targetParentId: 'empty',
        beforeComponentId: undefined,
      }),
    ).toBe(source)
    expect(source).toEqual(snapshot)
  })
})
