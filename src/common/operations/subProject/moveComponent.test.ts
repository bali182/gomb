import { describe, expect, it } from 'vitest'
import { d } from '../../testData'
import { accessors } from '../../utils/accessors'
import { moveComponent } from './moveComponent'
import { createBaseOperationParams } from './testUtils'

const fixture = () => {
  const first = d.pocketCluster({ id: 'first', children: ['a', 'front-a'] })
  const second = d.pocketCluster({ id: 'second', children: ['b', 'front-b'] })
  return d.subProject({
    frontFace: d.rootPanelFace({ id: 'root-front', children: ['first', 'second'] }),
    id: 'sub',
    root: d.rootPanel({ id: 'root' }),
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
    expect(accessors.subProject(moved).component.childIds('first')).toEqual(['front-a'])
    expect(accessors.subProject(moved).component.childIds('second')).toEqual(['a', 'b', 'front-b'])
    const reordered = moveComponent(createBaseOperationParams(moved), {
      id: 'a',
      targetParentId: 'second',
      beforeComponentId: 'front-b',
    })
    expect(accessors.subProject(reordered).component.childIds('second')).toEqual(['b', 'a', 'front-b'])
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
        targetParentId: 'root-front',
        beforeComponentId: undefined,
      }),
    ).toBe(source)
    expect(source).toEqual(snapshot)
  })

  it('keeps a lone front pocket immovable', () => {
    const source = fixture()
    accessors
      .subProject(source)
      .component.childIds('first')
      .splice(0, accessors.subProject(source).component.childIds('first').length, ...['front-a'])
    delete source.components.a
    source.components.empty = d.pocketCluster({ id: 'empty' })
    accessors
      .subProject(source)
      .component.childIds(accessors.subProject(source).component.rootPanel().frontFaceId)
      .push('empty')
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
