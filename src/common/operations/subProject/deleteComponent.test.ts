import { describe, expect, it } from 'vitest'
import { d } from '../../testData'
import { accessors } from '../../utils/accessors'
import { deleteComponent } from './deleteComponent'
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

describe('deleteComponent', () => {
  it('protects a front pocket while its cluster contains T-pockets and deletes an entire cluster tree', () => {
    const source = fixture()
    const snapshot = structuredClone(source)
    expect(deleteComponent(createBaseOperationParams(source), { id: 'front-a' })).toBe(source)
    const deleted = deleteComponent(createBaseOperationParams(source), { id: 'first' })
    expect(deleted.components['front-a']).toBeUndefined()
    expect(deleted.components.child).toBeUndefined()
    expect(source).toEqual(snapshot)
  })

  it('deletes a front pocket and its descendants when no T-pockets remain in its cluster', () => {
    const alone = fixture()
    alone.components.first.children = ['front-a']
    delete alone.components.a
    const before = structuredClone(alone)
    const front = accessors.subProject(alone).component.frontPocket('front-a')

    const result = deleteComponent(createBaseOperationParams(alone), { id: front.id })
    expect(result.components['front-a']).toBeUndefined()
    expect(result.components.child).toBeUndefined()
    expect(accessors.subProject(result).component.pocketCluster('first').children).toEqual([])
    expect(result.components.second).toBe(alone.components.second)
    expect(alone).toEqual(before)
  })
})
