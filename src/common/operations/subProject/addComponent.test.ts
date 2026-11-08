import { describe, expect, it, vi } from 'vitest'
import type { ComponentSchema } from '../../schemas/components'
import type { ReadonlyModelObjectFactorySchema } from '../../schemas/factory'
import type { ComponentInsertionPositionSchema } from '../../schemas/operations'
import type { SubProjectSchema } from '../../schemas/subProject'
import { d } from '../../testData'
import { EN } from '../../translations/en'
import { NameGenerator } from '../../utils/factory/NameGenerator'
import { ReadonlyModelObjectFactory } from '../../utils/factory/ReadonlyModelObjectFactory'
import { IdGenerator } from '../../utils/random/IdGenerator'
import { addComponent } from './addComponent'
import { createBaseOperationParams } from './testUtils'

const createFactory = (component: ComponentSchema): ReadonlyModelObjectFactorySchema => {
  const modelFactory = new ReadonlyModelObjectFactory(new IdGenerator(), new NameGenerator(EN.defaultNames))
  vi.spyOn(modelFactory, 'createComponent').mockReturnValue(component)
  return modelFactory
}

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

describe('addComponent', () => {
  it.each<{ position: ComponentInsertionPositionSchema; expected: string[] }>([
    { position: 'start', expected: ['new', 'first', 'second'] },
    { position: 'end', expected: ['first', 'second', 'new'] },
    { position: 0, expected: ['new', 'first', 'second'] },
    { position: 1, expected: ['first', 'new', 'second'] },
    { position: 2, expected: ['first', 'second', 'new'] },
  ])('inserts a normal child at $position without changing the source', ({ position, expected }) => {
    const source = fixture()
    const before = structuredClone(source)
    const component = d.panel({ id: 'new' })
    const result = addComponent(createBaseOperationParams(source, { readonlyFactory: createFactory(component) }), {
      parentId: 'root',
      type: component.type,
      position,
    })

    expect(result.components.root.children).toEqual(expected)
    expect(result.components.new).toBe(component)
    expect(source).toEqual(before)
  })

  it.each([-1, 3, 0.5, NaN, Infinity, -Infinity])('rejects invalid insertion index %s atomically', (position) => {
    const source = fixture()
    const result = addComponent(
      createBaseOperationParams(source, { readonlyFactory: createFactory(d.panel({ id: 'new' })) }),
      { parentId: 'root', type: 'panel', position },
    )

    expect(result).toBe(source)
    expect(result.components.new).toBeUndefined()
  })

  it('inserts new T-pockets at the requested start position', () => {
    const source = fixture()
    const added = addComponent(
      createBaseOperationParams(source, { readonlyFactory: createFactory(d.tPocket({ id: 'new' })) }),
      { parentId: 'first', type: 't-pocket', position: 'start' },
    )
    expect(added.components.first.children).toEqual(['new', 'a', 'front-a'])
  })

  it('inserts a T-pocket at the requested index', () => {
    const source = fixture()
    const result = addComponent(
      createBaseOperationParams(source, { readonlyFactory: createFactory(d.tPocket({ id: 'new' })) }),
      { parentId: 'first', type: 't-pocket', position: 1 },
    )

    expect(result.components.first.children).toEqual(['a', 'new', 'front-a'])
  })

  it.each<ComponentInsertionPositionSchema>(['end', 2])(
    'inserts a T-pocket at the requested position even after the front: %s',
    (position) => {
      const source = fixture()
      const result = addComponent(
        createBaseOperationParams(source, { readonlyFactory: createFactory(d.tPocket({ id: 'new' })) }),
        { parentId: 'first', type: 't-pocket', position },
      )

      expect(result.components.first.children).toEqual(['a', 'front-a', 'new'])
    },
  )

  it.each<{ position: ComponentInsertionPositionSchema; expected: string[] }>([
    { position: 'end', expected: ['a', 'recovered'] },
    { position: 1, expected: ['a', 'recovered'] },
    { position: 'start', expected: ['recovered', 'a'] },
    { position: 0, expected: ['recovered', 'a'] },
  ])('inserts a front pocket at the requested position: $position', ({ position, expected }) => {
    const source = fixture()
    source.components.first.children = ['a']
    const before = structuredClone(source)
    const result = addComponent(
      createBaseOperationParams(source, { readonlyFactory: createFactory(d.frontPocket({ id: 'recovered' })) }),
      { parentId: 'first', type: 'front-pocket', position },
    )

    expect(result.components.first.children).toEqual(expected)
    expect(source).toEqual(before)
  })

  it('inserts an empty cluster without creating any pockets', () => {
    const source = fixture()
    const before = structuredClone(source)
    const cluster = d.pocketCluster({ id: 'empty' })
    const result = addComponent(createBaseOperationParams(source, { readonlyFactory: createFactory(cluster) }), {
      parentId: 'root',
      type: cluster.type,
      position: 'end',
    })
    expect(result.components.root.children).toEqual(['first', 'second', 'empty'])
    expect(result.components.empty).toBe(cluster)
    expect(result.components.empty.children).toEqual([])
    expect(Object.keys(result.components)).toEqual([...Object.keys(source.components), 'empty'])
    expect(source).toEqual(before)
  })

  it('builds a cluster through successive pure insertions without changing earlier results', () => {
    const source = fixture()
    const before = structuredClone(source)
    const pockets = [d.tPocket({ id: 'new-t1' }), d.tPocket({ id: 'new-t2' }), d.frontPocket({ id: 'new-front' })]
    const cluster = d.pocketCluster({ id: 'new-cluster', children: [] })
    const withCluster = addComponent(createBaseOperationParams(source, { readonlyFactory: createFactory(cluster) }), {
      parentId: 'root',
      type: cluster.type,
      position: 'end',
    })
    const result = pockets.reduce<SubProjectSchema>(
      (current, pocket) =>
        addComponent(createBaseOperationParams(current, { readonlyFactory: createFactory(pocket) }), {
          parentId: cluster.id,
          type: pocket.type,
          position: 'end',
        }),
      withCluster,
    )

    expect(result.components.root.children).toEqual(['first', 'second', 'new-cluster'])
    expect(result.components['new-cluster'].children).toEqual(['new-t1', 'new-t2', 'new-front'])
    pockets.forEach((pocket) => expect(result.components[pocket.id]).toBe(pocket))
    expect(source).toEqual(before)
    expect(withCluster.components['new-cluster'].children).toEqual([])
    pockets.forEach((pocket) => expect(withCluster.components[pocket.id]).toBeUndefined())
  })

  it('adds a front pocket at the end of an empty cluster', () => {
    const source = fixture()
    const empty = {
      ...source,
      components: { ...source.components, first: d.pocketCluster({ id: 'first', children: [] }) },
    }
    expect(
      addComponent(
        createBaseOperationParams(empty, { readonlyFactory: createFactory(d.frontPocket({ id: 'recovered' })) }),
        { parentId: 'first', type: 'front-pocket', position: 'end' },
      ).components.first.children,
    ).toEqual(['recovered'])
  })
})
