import { describe, expect, it } from 'vitest'
import { d } from '../../testData'
import { narrowers } from '../narrowers'
import { accessors } from './index'

describe('StitchLineAccessor', () => {
  it('returns only T-pocket stitch lines owned by the requested component in source order', () => {
    const shared = d.tPocketStitchLine({ id: 'shared', targetId: 'cluster', targetType: 'component' })
    const second = d.tPocketStitchLine({ id: 'second', targetId: 'cluster', targetType: 'component' })
    const local = d.tPocketStitchLine({ id: 'local', targetId: 't', targetType: 'component' })
    const source = d.subProject({
      frontFace: d.rootPanelFace({ id: 'root-front', children: ['cluster'] }),
      id: 'sub',
      root: d.rootPanel({ id: 'root' }),
      components: [
        d.pocketCluster({ id: 'cluster', children: ['t', 'front'] }),
        d.tPocket({ id: 't' }),
        d.frontPocket({ id: 'front' }),
      ],
      stitchLines: [
        shared,
        d.componentBoundsStitchLine({ id: 'bounds', targetId: 'cluster', targetType: 'component' }),
        local,
        second,
      ],
    })
    const snapshot = structuredClone(source)
    const accessor = accessors.subProject(source)
    expect(accessor.stitchLine.byOwner('cluster').filter(narrowers.is.tPocketStitchLine)).toEqual([shared, second])
    expect(accessor.stitchLine.byOwner('t').filter(narrowers.is.tPocketStitchLine)).toEqual([local])
    expect(accessor.stitchLine.byOwner('front').filter(narrowers.is.tPocketStitchLine)).toEqual([])
    expect(accessor.stitchLine.byOwner('missing').filter(narrowers.is.tPocketStitchLine)).toEqual([])
    expect(accessor.stitchLine.byOwner('cluster').filter(narrowers.is.tPocketStitchLine)[0]).toBe(shared)
    expect(source).toEqual(snapshot)
  })

  it.each([false, true])('returns each stitch type by its unique ID regardless of array order: %s', (reverse) => {
    const bounds = d.componentBoundsStitchLine({ id: 'bounds', targetId: 'root-front', targetType: 'component' })
    const pocket = d.tPocketStitchLine({ id: 'pocket', targetId: 't', targetType: 'component' })
    const subProject = d.subProject({
      frontFace: d.rootPanelFace({ id: 'root-front', children: ['cluster'] }),
      id: 'sub',
      root: d.rootPanel({ id: 'root' }),
      components: [d.pocketCluster({ id: 'cluster', children: ['t'] }), d.tPocket({ id: 't' })],
      stitchLines: reverse ? [pocket, bounds] : [bounds, pocket],
    })
    const snapshot = structuredClone(subProject)
    const accessor = accessors.subProject(subProject)
    expect(accessor.stitchLine.byId('bounds')).toBe(bounds)
    expect(accessor.stitchLine.byId('pocket')).toBe(pocket)
    expect(accessor.optional.stitchLine.bounds('bounds')).toBe(bounds)
    expect(accessor.optional.stitchLine.tPocket('pocket')).toBe(pocket)
    expect(accessor.stitchLine.bounds('bounds')).toBe(bounds)
    expect(accessor.stitchLine.tPocket('pocket')).toBe(pocket)
    expect(accessor.optional.stitchLine.bounds('missing')).toBeUndefined()
    expect(accessor.optional.stitchLine.tPocket('missing')).toBeUndefined()
    expect(() => accessor.stitchLine.bounds('missing')).toThrow('Missing component bounds stitch line')
    expect(() => accessor.stitchLine.tPocket('missing')).toThrow('Missing t-pocket stitch line')
    expect(subProject).toEqual(snapshot)
  })

  it('does not return a different stitch type when only its ID matches', () => {
    const subProject = d.subProject({
      id: 'sub',
      root: d.rootPanel({ id: 'root' }),
      stitchLines: [
        d.componentBoundsStitchLine({ id: 'bounds', targetId: 'root-front', targetType: 'component' }),
        d.tPocketStitchLine({ id: 'pocket', targetId: 't', targetType: 'component' }),
      ],
    })
    const accessor = accessors.subProject(subProject)
    expect(accessor.optional.stitchLine.tPocket('bounds')).toBeUndefined()
    expect(accessor.optional.stitchLine.bounds('pocket')).toBeUndefined()
    expect(() => accessor.stitchLine.tPocket('bounds')).toThrow('Missing t-pocket stitch line')
    expect(() => accessor.stitchLine.bounds('pocket')).toThrow('Missing component bounds stitch line')
  })
})

describe('stitch line grouping', () => {
  it('distinguishes ownership from drawing layers, resolves hole owners and preserves source order', () => {
    const first = d.componentBoundsStitchLine({
      id: 'first',
      targetType: 'component',
      targetId: 'panel',
      onTop: 'root-front',
    })
    const second = d.componentBoundsStitchLine({
      id: 'second',
      targetType: 'hole',
      targetId: 'hole',
      onTop: 'root-front',
    })
    const fallback = d.componentBoundsStitchLine({
      id: 'fallback',
      targetType: 'component',
      targetId: 'panel',
      onTop: 'missing',
    })
    const shared = d.tPocketStitchLine({ id: 'shared', targetType: 'component', targetId: 'cluster' })
    const subProject = d.subProject({
      frontFace: d.rootPanelFace({ id: 'root-front', children: ['panel', 'cluster'] }),
      id: 'sub',
      root: d.rootPanel({ id: 'root' }),
      components: [
        d.panel({ id: 'panel' }),
        d.pocketCluster({ id: 'cluster', children: ['t'] }),
        d.tPocket({ id: 't' }),
      ],
      holes: [d.hole({ id: 'hole', componentId: 'panel' })],
      stitchLines: [first, second, fallback, shared],
    })
    const accessor = accessors.subProject(subProject)
    expect(accessor.stitchLine.byOwner('panel')).toEqual([first, second, fallback])
    expect(accessor.stitchLine.byOnTop('root-front')).toEqual([first, second])
    expect(accessor.stitchLine.byOnTop('panel')).toEqual([fallback])
    expect(accessor.stitchLine.byOwner('cluster')).toEqual([shared])
    expect(accessor.stitchLine.byOwner('hole')).toEqual([])
    expect(accessor.stitchLine.byOwner('missing')).toEqual([])
    expect(accessor.optional.stitchLine.byOnTop('missing')).toEqual([])
  })
})

describe('stitch line pocket cluster', () => {
  it('resolves the owner or its immediate parent for component and hole targets', () => {
    const cluster = d.pocketCluster({ id: 'cluster', children: ['t', 'front', 'panel'] })
    const subProject = d.subProject({
      frontFace: d.rootPanelFace({ id: 'root-front', children: ['cluster'] }),
      id: 'sub',
      root: d.rootPanel({ id: 'root' }),
      components: [cluster, d.tPocket({ id: 't' }), d.frontPocket({ id: 'front' }), d.panel({ id: 'panel' })],
      holes: [d.hole({ id: 'cluster-hole', componentId: 'cluster' }), d.hole({ id: 't-hole', componentId: 't' })],
      stitchLines: [
        d.tPocketStitchLine({ id: 'cluster-stitch', targetType: 'component', targetId: 'cluster' }),
        d.tPocketStitchLine({ id: 't-stitch', targetType: 'component', targetId: 't' }),
        d.componentBoundsStitchLine({ id: 'front-stitch', targetType: 'component', targetId: 'front' }),
        d.componentBoundsStitchLine({
          id: 'panel-stitch',
          targetType: 'component',
          targetId: 'panel',
          onTop: 'root-front',
        }),
        d.componentBoundsStitchLine({ id: 'cluster-hole-stitch', targetType: 'hole', targetId: 'cluster-hole' }),
        d.componentBoundsStitchLine({ id: 't-hole-stitch', targetType: 'hole', targetId: 't-hole' }),
      ],
    })
    const snapshot = structuredClone(subProject)
    const accessor = accessors.subProject(subProject)

    for (const stitchLine of subProject.stitchLines) {
      expect(accessor.optional.stitchLine.ownerPocketCluster(stitchLine.id)).toBe(cluster)
      expect(accessor.stitchLine.ownerPocketCluster(stitchLine.id)).toBe(cluster)
    }

    const optionalPocketCluster = accessor.optional.stitchLine.ownerPocketCluster
    const pocketCluster = accessor.stitchLine.ownerPocketCluster
    expect(optionalPocketCluster('t-stitch')).toBe(cluster)
    expect(pocketCluster('t-stitch')).toBe(cluster)
    expect(subProject).toEqual(snapshot)
  })

  it.each([
    'missing-stitch',
    'missing-owner',
    'missing-hole',
    'missing-hole-owner',
    'root-stitch',
    'no-parent',
    'non-cluster-parent',
    'grandparent-cluster',
    'drawing-layer-cluster',
  ])('returns undefined optionally and throws strictly when cluster resolution fails: %s', (id) => {
    const subProject = d.subProject({
      frontFace: d.rootPanelFace({ id: 'root-front', children: ['cluster', 'panel'] }),
      id: 'sub',
      root: d.rootPanel({ id: 'root' }),
      components: [
        d.pocketCluster({ id: 'cluster', children: ['nested-panel', 'missing-component'] }),
        d.panel({ id: 'nested-panel', children: ['nested-t'] }),
        d.tPocket({ id: 'nested-t' }),
        d.panel({ id: 'panel', children: ['t'] }),
        d.tPocket({ id: 't' }),
        d.tPocket({ id: 'detached-t' }),
      ],
      holes: [d.hole({ id: 'dangling-hole', componentId: 'missing-component' })],
      stitchLines: [
        d.tPocketStitchLine({ id: 'missing-owner', targetType: 'component', targetId: 'missing-component' }),
        d.componentBoundsStitchLine({ id: 'missing-hole', targetType: 'hole', targetId: 'missing' }),
        d.componentBoundsStitchLine({ id: 'missing-hole-owner', targetType: 'hole', targetId: 'dangling-hole' }),
        d.componentBoundsStitchLine({ id: 'root-stitch', targetType: 'component', targetId: 'root-front' }),
        d.tPocketStitchLine({ id: 'no-parent', targetType: 'component', targetId: 'detached-t' }),
        d.tPocketStitchLine({ id: 'non-cluster-parent', targetType: 'component', targetId: 't' }),
        d.tPocketStitchLine({ id: 'grandparent-cluster', targetType: 'component', targetId: 'nested-t' }),
        d.componentBoundsStitchLine({
          id: 'drawing-layer-cluster',
          targetType: 'component',
          targetId: 'root-front',
          onTop: 'cluster',
        }),
      ],
    })
    const snapshot = structuredClone(subProject)
    const accessor = accessors.subProject(subProject)

    expect(accessor.optional.stitchLine.ownerPocketCluster(id)).toBeUndefined()
    expect(() => accessor.stitchLine.ownerPocketCluster(id)).toThrow('Missing pocket cluster from sub-project sub.')
    expect(subProject).toEqual(snapshot)
  })
})

it('returns names of both stitch line types and includes lines without a resolved owner', () => {
  const subProject = d.subProject({
    id: 'sub',
    root: d.rootPanel({ id: 'root' }),
    stitchLines: [
      d.componentBoundsStitchLine({
        id: 'bounds',
        name: 'Edge stitching',
        targetId: 'root-front',
        targetType: 'component',
      }),
      d.tPocketStitchLine({ id: 'pocket', name: 'Pocket stitching', targetId: 'root-back', targetType: 'component' }),
      d.componentBoundsStitchLine({
        id: 'unresolved',
        name: 'Unresolved stitching',
        targetId: 'missing-hole',
        targetType: 'hole',
      }),
    ],
  })
  const accessor = accessors.subProject(subProject)
  const names = accessor.stitchLine.names
  const optionalNames = accessor.optional.stitchLine.names
  expect(names()).toEqual(new Set(['Edge stitching', 'Pocket stitching', 'Unresolved stitching']))
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
  const empty = accessors.subProject({ ...subProject, stitchLines: [] })
  expect(empty.stitchLine.names()).toEqual(new Set([]))
  expect(empty.optional.stitchLine.names()).toEqual(new Set([]))
})
