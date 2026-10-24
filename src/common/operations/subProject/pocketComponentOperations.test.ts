import { describe, expect, it } from 'vitest'
import type { SubProjectSchema } from '../../schemas/subProject'
import { d } from '../../testData'
import { addComponent, type ComponentInsertionPositionSchema } from './addComponent'
import { cloneComponent } from './cloneComponent'
import { deleteComponent } from './deleteComponent'
import { moveComponent } from './moveComponent'
import { moveStitchLine } from './moveStitchLine'
import { canAddChild, canAddStitchLine, canMoveComponent } from './utils/componentRules'
import { getUnusedName } from './utils/getUnusedName'

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
describe('pocket component operations', () => {
  it('permits stitching only on supported components and clusters with a front pocket', () => {
    const source = fixture()
    const empty = d.pocketCluster({ id: 'empty' })
    const withoutFront = d.pocketCluster({ id: 'without-front', children: ['a'] })
    expect(canAddStitchLine(empty, source)).toBe(false)
    expect(canAddStitchLine(withoutFront, source)).toBe(false)
    expect(canAddStitchLine(source.components.first, source)).toBe(true)
    expect(canAddStitchLine(source.components['front-a'], source)).toBe(false)
    expect(canAddStitchLine(source.components.a, source)).toBe(true)
    expect(canAddStitchLine(source.components.root, source)).toBe(true)
    expect(canAddStitchLine(source.components.child, source)).toBe(true)
  })

  it('rejects moving stitching to a cluster without a front and permits a compatible populated cluster', () => {
    const fixtureSource = fixture()
    const empty = d.pocketCluster({ id: 'empty' })
    const withoutFront = d.pocketCluster({ id: 'without-front', children: ['a'] })
    const source: SubProjectSchema = {
      ...fixtureSource,
      components: { ...fixtureSource.components, empty, 'without-front': withoutFront },
      stitchLines: [d.componentBoundsStitchLine({ id: 'line', targetId: 'root', targetType: 'component' })],
    }
    const snapshot = structuredClone(source)
    for (const targetId of ['empty', 'without-front', 'front-a', 'a']) {
      expect(moveStitchLine(source, { stitchLineId: 'line', targetId, targetType: 'component' })).toBe(source)
    }
    const moved = moveStitchLine(source, { stitchLineId: 'line', targetId: 'first', targetType: 'component' })
    expect(moved.stitchLines[0]).toEqual({ ...source.stitchLines[0], targetId: 'first' })
    expect(moved.components).toBe(source.components)
    expect(source).toEqual(snapshot)
  })

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
    const result = addComponent(source, { parentId: 'root', component, position })

    expect(result.components.root.children).toEqual(expected)
    expect(result.components.new).toBe(component)
    expect(source).toEqual(before)
  })
  it.each([-1, 3, 0.5, NaN, Infinity, -Infinity])('rejects invalid insertion index %s atomically', (position) => {
    const source = fixture()
    const result = addComponent(source, {
      parentId: 'root',
      component: d.panel({ id: 'new' }),
      position,
    })

    expect(result).toBe(source)
    expect(result.components.new).toBeUndefined()
  })
  it('inserts new T-pockets at the requested start position', () => {
    const source = fixture()
    const added = addComponent(source, { parentId: 'first', component: d.tPocket({ id: 'new' }), position: 'start' })
    expect(added.components.first.children).toEqual(['new', 'a', 'front-a'])
  })
  it('inserts a T-pocket at the requested index', () => {
    const source = fixture()
    const result = addComponent(source, { parentId: 'first', component: d.tPocket({ id: 'new' }), position: 1 })

    expect(result.components.first.children).toEqual(['a', 'new', 'front-a'])
  })
  it.each<ComponentInsertionPositionSchema>(['end', 2])(
    'inserts a T-pocket at the requested position even after the front: %s',
    (position) => {
      const source = fixture()
      const result = addComponent(source, { parentId: 'first', component: d.tPocket({ id: 'new' }), position })

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
    const result = addComponent(source, {
      parentId: 'first',
      component: d.frontPocket({ id: 'recovered' }),
      position,
    })

    expect(result.components.first.children).toEqual(expected)
    expect(source).toEqual(before)
  })
  it('leaves child type and duplicate front restrictions to the component rules', () => {
    const source = fixture()
    expect(canAddChild(source.components.first, 't-pocket', source)).toBe(true)
    expect(canAddChild(source.components.first, 'front-pocket', source)).toBe(false)
    expect(canAddChild(source.components.first, 'panel', source)).toBe(false)
    expect(canAddChild(source.components.a, 'panel', source)).toBe(false)
  })
  it('only permits adding the front pocket while a cluster has no front pocket', () => {
    const source = fixture()
    const cluster = d.pocketCluster({ id: 'empty' })
    const withEmpty = addComponent(source, { parentId: 'root', component: cluster, position: 'end' })
    expect(canAddChild(cluster, 't-pocket', withEmpty)).toBe(false)
    expect(canAddChild(cluster, 'front-pocket', withEmpty)).toBe(true)
    expect(canAddChild(cluster, 'panel', withEmpty)).toBe(false)
    expect(
      canMoveComponent(withEmpty, { componentId: 'a', targetParentId: cluster.id, beforeComponentId: undefined }),
    ).toBe(false)

    const withFront = addComponent(withEmpty, {
      parentId: cluster.id,
      component: d.frontPocket({ id: 'new-front' }),
      position: 'end',
    })
    expect(canAddChild(withFront.components.empty, 't-pocket', withFront)).toBe(true)
    expect(canAddChild(withFront.components.empty, 'front-pocket', withFront)).toBe(false)
    expect(
      canMoveComponent(withFront, { componentId: 'a', targetParentId: cluster.id, beforeComponentId: 'new-front' }),
    ).toBe(true)
  })

  it('also rejects T-pockets when existing children contain no front pocket', () => {
    const source = fixture()
    source.components.first.children = ['a']
    expect(canAddChild(source.components.first, 't-pocket', source)).toBe(false)
    expect(canAddChild(source.components.first, 'front-pocket', source)).toBe(true)
  })

  it('inserts an empty cluster without creating any pockets', () => {
    const source = fixture()
    const before = structuredClone(source)
    const cluster = d.pocketCluster({ id: 'empty' })
    const result = addComponent(source, { parentId: 'root', component: cluster, position: 'end' })
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
    const withCluster = addComponent(source, { parentId: 'root', component: cluster, position: 'end' })
    const result = pockets.reduce<SubProjectSchema>(
      (current, pocket) => addComponent(current, { parentId: cluster.id, component: pocket, position: 'end' }),
      withCluster,
    )

    expect(result.components.root.children).toEqual(['first', 'second', 'new-cluster'])
    expect(result.components['new-cluster'].children).toEqual(['new-t1', 'new-t2', 'new-front'])
    pockets.forEach((pocket) => expect(result.components[pocket.id]).toBe(pocket))
    expect(source).toEqual(before)
    expect(withCluster.components['new-cluster'].children).toEqual([])
    pockets.forEach((pocket) => expect(withCluster.components[pocket.id]).toBeUndefined())
  })
  it('moves T-pockets between clusters and keeps each front last', () => {
    const source = fixture()
    const moved = moveComponent(source, { componentId: 'a', targetParentId: 'second', beforeComponentId: 'b' })
    expect(moved.components.first.children).toEqual(['front-a'])
    expect(moved.components.second.children).toEqual(['a', 'b', 'front-b'])
    const reordered = moveComponent(moved, { componentId: 'a', targetParentId: 'second', beforeComponentId: 'front-b' })
    expect(reordered.components.second.children).toEqual(['b', 'a', 'front-b'])
  })
  it('protects fronts and rejects invalid parents without modifying the project', () => {
    const source = fixture()
    expect(deleteComponent(source, { componentId: 'front-a' })).toBe(source)
    expect(
      moveComponent(source, { componentId: 'front-a', targetParentId: 'second', beforeComponentId: undefined }),
    ).toBe(source)
    expect(moveComponent(source, { componentId: 'a', targetParentId: 'root', beforeComponentId: undefined })).toBe(
      source,
    )
    const deleted = deleteComponent(source, { componentId: 'first' })
    expect(deleted.components['front-a']).toBeUndefined()
    expect(deleted.components.child).toBeUndefined()
  })
  it('adds a front pocket at the end of an empty cluster', () => {
    const source = fixture()
    const empty = {
      ...source,
      components: { ...source.components, first: d.pocketCluster({ id: 'first', children: [] }) },
    }
    expect(
      addComponent(empty, { parentId: 'first', component: d.frontPocket({ id: 'recovered' }), position: 'end' })
        .components.first.children,
    ).toEqual(['recovered'])
  })
  it('copies pockets and their nested children', () => {
    const source = fixture()
    let next = 0
    const result = cloneComponent(source, {
      componentId: 'first',
      settings: { cloneComponentTree: true, cloneHoles: true, cloneStitchLines: true },
      ids: { component: () => `copy-${next++}`, hole: () => `hole-${next++}`, stitchLine: () => `stitch-${next++}` },
      names: { component: getUnusedName, hole: getUnusedName, stitchLine: getUnusedName },
    })
    const rootId = result.components.root.children[1]
    const copy = result.components[rootId]
    expect(copy.type).toBe('pocket-cluster')
    expect(copy.children).toHaveLength(2)
    const front = result.components[copy.children[1]]
    expect(front.type).toBe('front-pocket')
    expect(front.children).toHaveLength(1)
  })
  it('clones a pocket cluster without its children as an empty sibling', () => {
    const source = fixture()
    const before = structuredClone(source)
    let next = 0

    const result = cloneComponent(source, {
      componentId: 'first',
      settings: { cloneComponentTree: false, cloneHoles: true, cloneStitchLines: true },
      ids: { component: () => `copy-${next++}`, hole: () => `hole-${next++}`, stitchLine: () => `stitch-${next++}` },
      names: { component: getUnusedName, hole: getUnusedName, stitchLine: getUnusedName },
    })
    expect(result.components.root.children).toEqual(['first', 'copy-0', 'second'])
    expect(result.components['copy-0']).toMatchObject({ type: 'pocket-cluster', children: [] })
    expect(Object.keys(result.components)).toEqual([...Object.keys(source.components), 'copy-0'])
    expect(result.components.first).toBe(source.components.first)
    expect(source).toEqual(before)
    expect(next).toBe(1)
  })
})
