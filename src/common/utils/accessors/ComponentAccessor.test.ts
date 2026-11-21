import { describe, expect, it } from 'vitest'
import type { ComponentSchema } from '../../schemas/components'
import { d } from '../../testData'
import { accessors } from './index'

describe('ComponentAccessor', () => {
  it('resolves children in source order and handles missing references according to strictness', () => {
    const root = d.rootPanel({ id: 'root' })
    const first = d.panel({ id: 'first' })
    const second = d.panel({ id: 'second' })
    const subProject = d.subProject({
      frontFace: d.rootPanelFace({ id: 'root-front', children: ['second', 'first'] }),
      id: 'sub',
      root,
      components: [first, second],
    })
    const snapshot = structuredClone(subProject)
    const accessor = accessors.subProject(subProject)
    const children = accessor.component.children
    const optionalChildren = accessor.optional.component.children

    expect(children('root-front')).toEqual([second, first])
    expect(children('root-front')[0]).toBe(second)
    expect(children('first')).toEqual([])
    expect(optionalChildren('root-front')).toEqual([second, first])
    expect(optionalChildren('missing')).toEqual([])
    expect(() => children('missing')).toThrow('Missing component')

    const incomplete = accessors.subProject({
      ...subProject,
      components: {
        ...subProject.components,
        'root-front': {
          ...accessors.subProject(subProject).component.rootPanelFace('root-front'),
          children: ['second', 'missing', 'first'],
        },
      },
    })
    expect(incomplete.optional.component.children('root-front')).toEqual([second, first])
    expect(() => incomplete.component.children('root-front')).toThrow('Missing component')
    expect(subProject).toEqual(snapshot)
  })

  it('returns the immediate parent and leaves absent parents undefined', () => {
    const root = d.rootPanel({ id: 'root' })
    const cluster = d.pocketCluster({ id: 'cluster', children: ['t', 'front'] })
    const source = d.subProject({
      frontFace: d.rootPanelFace({ id: 'root-front', children: ['cluster'] }),
      id: 'sub',
      root,
      components: [cluster, d.tPocket({ id: 't' }), d.frontPocket({ id: 'front' })],
    })
    const snapshot = structuredClone(source)
    const accessor = accessors.subProject(source)
    expect(accessor.optional.component.parent('t')).toBe(cluster)
    expect(accessor.optional.component.parent('front')).toBe(cluster)
    expect(accessor.optional.component.parent('cluster')).toBe(source.components['root-front'])
    expect(accessor.component.parent('t')).toBe(cluster)
    expect(accessor.component.parent('front')).toBe(cluster)
    expect(accessor.component.parent('cluster')).toBe(source.components['root-front'])
    expect(() => accessor.component.parent('root')).toThrow('Missing parent')
    expect(() => accessor.component.parent('missing')).toThrow('Missing parent')
    expect(accessor.optional.component.parent('root')).toBeUndefined()
    expect(accessor.optional.component.parent('missing')).toBeUndefined()
    expect(source).toEqual(snapshot)
  })

  it('returns the supported component types and leaves wrong or missing IDs unmatched', () => {
    const subProject = d.subProject({
      frontFace: d.rootPanelFace({ id: 'root-front', children: ['panel', 'cluster'] }),
      id: 'sub',
      root: d.rootPanel({ id: 'root' }),
      components: [
        d.panel({ id: 'panel' }),
        d.pocketCluster({ id: 'cluster', children: ['t', 'front'] }),
        d.tPocket({ id: 't' }),
        d.frontPocket({ id: 'front' }),
      ],
    })
    const snapshot = structuredClone(subProject)
    const optional = accessors.subProject(subProject).optional
    expect(optional.component.rootPanel()).toBe(subProject.components.root)
    expect(accessors.subProject({ ...subProject, root: 'missing' }).optional.component.rootPanel()).toBeUndefined()
    expect(accessors.subProject({ ...subProject, root: 'panel' }).optional.component.rootPanel()).toBeUndefined()
    for (const [id, getter, wrongId] of [
      ['panel', optional.component.panel, 'cluster'],
      ['cluster', optional.component.pocketCluster, 'panel'],
      ['front', optional.component.frontPocket, 'panel'],
      ['t', optional.component.tPocket, 'front'],
      ['front', optional.component.pocket, 'panel'],
      ['t', optional.component.pocket, 'panel'],
    ] as const) {
      expect(getter(id)).toBe(subProject.components[id])
      expect(getter(wrongId)).toBeUndefined()
      expect(getter('missing')).toBeUndefined()
    }
    expect(subProject).toEqual(snapshot)
  })
})

it('returns all component names including custom face names through strict and optional accessors', () => {
  const subProject = d.subProject({
    id: 'sub',
    root: d.rootPanel({ id: 'root', name: 'Wallet' }),
    frontFace: d.rootPanelFace({ id: 'root-front', name: 'Outside' }),
    backFace: d.rootPanelFace({ id: 'root-back', name: 'Inside' }),
    components: [d.panel({ id: 'pocket', name: 'Pocket' })],
  })
  const accessor = accessors.subProject(subProject)
  const names = accessor.component.names
  const optionalNames = accessor.optional.component.names
  expect(names()).toEqual(new Set(['Wallet', 'Outside', 'Inside', 'Pocket']))
  expect(optionalNames()).toEqual(names())
  const snapshot = structuredClone(subProject)
  const expectedNames = names()
  for (const getNames of [names, optionalNames]) {
    const result = getNames()
    result.clear()
    result.add('Temporary name')
    expect(names()).toEqual(expectedNames)
    expect(optionalNames()).toEqual(expectedNames)
  }
  expect(subProject).toEqual(snapshot)
  const empty = accessors.subProject({ ...subProject, components: {} })
  expect(empty.component.names()).toEqual(new Set([]))
  expect(empty.optional.component.names()).toEqual(new Set([]))
})

it('resolves ancestors from the immediate parent to the root using source components', () => {
  const root = d.rootPanel({ id: 'root' })
  const face = d.rootPanelFace({ id: 'root-front', children: ['panel'] })
  const panel = d.panel({ id: 'panel', children: ['cluster'] })
  const cluster = d.pocketCluster({ id: 'cluster', children: ['pocket'] })
  const pocket = d.tPocket({ id: 'pocket' })
  const subProject = d.subProject({
    id: 'sub',
    root,
    frontFace: face,
    components: [panel, cluster, pocket, d.panel({ id: 'detached' })],
  })
  const snapshot = structuredClone(subProject)
  const accessor = accessors.subProject(subProject)
  const ancestors = accessor.component.ancestors
  const optionalAncestors = accessor.optional.component.ancestors
  const chain = ancestors(pocket.id)
  expect(chain).toEqual([cluster, panel, face, root])
  expect(chain[0]).toBe(cluster)
  expect(chain[3]).toBe(root)
  expect(optionalAncestors(pocket.id)).toEqual(chain)
  expect(ancestors(face.id)).toEqual([root])
  expect(ancestors(root.id)).toEqual([])
  expect(ancestors('detached')).toEqual([])
  expect(optionalAncestors('missing')).toEqual([])
  expect(() => ancestors('missing')).toThrow('Missing component')
  expect(subProject).toEqual(snapshot)
})

it('stops at a repeated ancestor without including the starting component', () => {
  const subProject = d.subProject({
    id: 'sub',
    root: d.rootPanel({ id: 'root' }),
    components: [d.panel({ id: 'first', children: ['second'] }), d.panel({ id: 'second', children: ['first'] })],
  })
  const accessor = accessors.subProject(subProject)
  expect(accessor.component.ancestors('first')).toEqual([subProject.components.second])
  expect(accessor.optional.component.ancestors('second')).toEqual([subProject.components.first])
})

it.each([false, true])('resolves ancestor IDs and objects with includeSelf: %s', (includeSelf) => {
  const root = d.rootPanel({ id: 'root' })
  const face = d.rootPanelFace({ id: 'root-front', children: ['panel'] })
  const panel = d.panel({ id: 'panel', children: ['child'] })
  const child = d.panel({ id: 'child' })
  const subProject = d.subProject({ id: 'sub', root, frontFace: face, components: [panel, child] })
  const accessor = accessors.subProject(subProject)
  const expectedIds = includeSelf ? ['child', 'panel', 'root-front', 'root'] : ['panel', 'root-front', 'root']
  const expectedComponents = includeSelf ? [child, panel, face, root] : [panel, face, root]
  const ancestorIds = accessor.component.ancestorIds
  const optionalAncestorIds = accessor.optional.component.ancestorIds
  expect(ancestorIds('child', includeSelf)).toEqual(expectedIds)
  expect(optionalAncestorIds('child', includeSelf)).toEqual(expectedIds)
  expect(accessor.component.ancestors('child', includeSelf)).toEqual(expectedComponents)
  expect(accessor.optional.component.ancestors('child', includeSelf)).toEqual(expectedComponents)
  expect(ancestorIds('root', includeSelf)).toEqual(includeSelf ? ['root'] : [])
  expect(accessor.component.ancestors('root', includeSelf)).toEqual(includeSelf ? [root] : [])
  expect(ancestorIds('child')).toEqual(['panel', 'root-front', 'root'])
})

it.each([false, true])('resolves descendants in depth-first order with includeSelf: %s', (includeSelf) => {
  const root = d.rootPanel({ id: 'root' })
  const face = d.rootPanelFace({ id: 'root-front', children: ['first', 'second'] })
  const backFace = d.rootPanelFace({ id: 'root-back' })
  const first = d.panel({ id: 'first', children: ['shared'] })
  const second = d.panel({ id: 'second', children: ['shared', 'leaf'] })
  const shared = d.panel({ id: 'shared' })
  const leaf = d.panel({ id: 'leaf' })
  const subProject = d.subProject({
    id: 'sub',
    root,
    frontFace: face,
    backFace,
    components: [first, second, shared, leaf],
  })
  const snapshot = structuredClone(subProject)
  const accessor = accessors.subProject(subProject)
  const descendantIds = accessor.component.descendantIds
  const optionalDescendantIds = accessor.optional.component.descendantIds
  const descendants = accessor.component.descendants
  const optionalDescendants = accessor.optional.component.descendants
  const expectedIds = ['root-front', 'first', 'shared', 'second', 'leaf', 'root-back']
  const expectedComponents: ComponentSchema[] = [face, first, shared, second, leaf, backFace]
  if (includeSelf) {
    expectedIds.unshift('root')
    expectedComponents.unshift(root)
  }
  expect(descendantIds('root', includeSelf)).toEqual(expectedIds)
  expect(optionalDescendantIds('root', includeSelf)).toEqual(expectedIds)
  expect(descendants('root', includeSelf)).toEqual(expectedComponents)
  expect(optionalDescendants('root', includeSelf)).toEqual(expectedComponents)
  expect(descendants('first')[0]).toBe(shared)
  expect(descendantIds('leaf', includeSelf)).toEqual(includeSelf ? ['leaf'] : [])
  expect(descendants('leaf', includeSelf)).toEqual(includeSelf ? [leaf] : [])
  expect(descendantIds('first')).toEqual(['shared'])
  expect(subProject).toEqual(snapshot)
})

it('preserves missing reference IDs while optional object resolution filters them and strict resolution throws', () => {
  const root = d.rootPanel({ id: 'root' })
  const face = d.rootPanelFace({ id: 'root-front', children: ['panel'] })
  const panel = d.panel({ id: 'panel', children: ['missing', 'child'] })
  const child = d.panel({ id: 'child' })
  const subProject = d.subProject({ id: 'sub', root, frontFace: face, components: [panel, child] })
  const accessor = accessors.subProject(subProject)
  expect(accessor.component.descendantIds('panel')).toEqual(['missing', 'child'])
  expect(accessor.optional.component.descendantIds('panel')).toEqual(['missing', 'child'])
  expect(accessor.optional.component.descendants('panel')).toEqual([child])
  expect(accessor.optional.component.descendants('panel', true)).toEqual([panel, child])
  expect(() => accessor.component.descendants('panel')).toThrow('Missing component')
  expect(accessor.component.ancestorIds('missing', true)).toEqual(['missing', 'panel', 'root-front', 'root'])
  expect(accessor.optional.component.ancestorIds('missing', true)).toEqual(['missing', 'panel', 'root-front', 'root'])
  expect(accessor.optional.component.ancestors('missing', true)).toEqual([panel, face, root])
  expect(() => accessor.component.ancestors('missing', true)).toThrow('Missing component')
})

it.each([false, true])('handles an unknown starting ID with includeSelf: %s', (includeSelf) => {
  const subProject = d.subProject({ id: 'sub', root: d.rootPanel({ id: 'root' }) })
  const accessor = accessors.subProject(subProject)
  const expectedIds = includeSelf ? ['missing'] : []
  expect(accessor.component.ancestorIds('missing', includeSelf)).toEqual(expectedIds)
  expect(accessor.optional.component.ancestorIds('missing', includeSelf)).toEqual(expectedIds)
  expect(accessor.component.descendantIds('missing', includeSelf)).toEqual(expectedIds)
  expect(accessor.optional.component.descendantIds('missing', includeSelf)).toEqual(expectedIds)
  expect(accessor.optional.component.ancestors('missing', includeSelf)).toEqual([])
  expect(accessor.optional.component.descendants('missing', includeSelf)).toEqual([])
  expect(() => accessor.component.ancestors('missing', includeSelf)).toThrow('Missing component')
  expect(() => accessor.component.descendants('missing', includeSelf)).toThrow('Missing component')
})

it.each([false, true])('stops cycles without repeating IDs with includeSelf: %s', (includeSelf) => {
  const first = d.panel({ id: 'first', children: ['second'] })
  const second = d.panel({ id: 'second', children: ['first'] })
  const subProject = d.subProject({ id: 'sub', root: d.rootPanel({ id: 'root' }), components: [first, second] })
  const accessor = accessors.subProject(subProject)
  const expectedIds = includeSelf ? ['first', 'second'] : ['second']
  const expectedComponents = includeSelf ? [first, second] : [second]
  expect(accessor.component.ancestorIds('first', includeSelf)).toEqual(expectedIds)
  expect(accessor.optional.component.ancestorIds('first', includeSelf)).toEqual(expectedIds)
  expect(accessor.component.descendantIds('first', includeSelf)).toEqual(expectedIds)
  expect(accessor.optional.component.descendantIds('first', includeSelf)).toEqual(expectedIds)
  expect(accessor.component.ancestors('first', includeSelf)).toEqual(expectedComponents)
  expect(accessor.optional.component.ancestors('first', includeSelf)).toEqual(expectedComponents)
  expect(accessor.component.descendants('first', includeSelf)).toEqual(expectedComponents)
  expect(accessor.optional.component.descendants('first', includeSelf)).toEqual(expectedComponents)
})
