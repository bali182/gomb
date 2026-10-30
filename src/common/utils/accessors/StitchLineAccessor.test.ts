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
      id: 'sub',
      root: d.rootPanel({ id: 'root', children: ['cluster'] }),
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
    const bounds = d.componentBoundsStitchLine({ id: 'bounds', targetId: 'root', targetType: 'component' })
    const pocket = d.tPocketStitchLine({ id: 'pocket', targetId: 't', targetType: 'component' })
    const subProject = d.subProject({
      id: 'sub',
      root: d.rootPanel({ id: 'root', children: ['cluster'] }),
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
        d.componentBoundsStitchLine({ id: 'bounds', targetId: 'root', targetType: 'component' }),
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
      onTop: 'root',
    })
    const second = d.componentBoundsStitchLine({ id: 'second', targetType: 'hole', targetId: 'hole', onTop: 'root' })
    const fallback = d.componentBoundsStitchLine({
      id: 'fallback',
      targetType: 'component',
      targetId: 'panel',
      onTop: 'missing',
    })
    const shared = d.tPocketStitchLine({ id: 'shared', targetType: 'component', targetId: 'cluster' })
    const subProject = d.subProject({
      id: 'sub',
      root: d.rootPanel({ id: 'root', children: ['panel', 'cluster'] }),
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
    expect(accessor.stitchLine.byOnTop('root')).toEqual([first, second])
    expect(accessor.stitchLine.byOnTop('panel')).toEqual([fallback])
    expect(accessor.stitchLine.byOwner('cluster')).toEqual([shared])
    expect(accessor.stitchLine.byOwner('hole')).toEqual([])
    expect(accessor.stitchLine.byOwner('missing')).toEqual([])
    expect(accessor.optional.stitchLine.byOnTop('missing')).toEqual([])
  })
})
