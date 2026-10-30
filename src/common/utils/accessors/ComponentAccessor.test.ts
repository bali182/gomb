import { describe, expect, it } from 'vitest'
import { d } from '../../testData'
import { accessors } from './index'

describe('ComponentAccessor', () => {
  it('returns the immediate parent and leaves absent parents undefined', () => {
    const root = d.rootPanel({ id: 'root', children: ['cluster'] })
    const cluster = d.pocketCluster({ id: 'cluster', children: ['t', 'front'] })
    const source = d.subProject({
      id: 'sub',
      root,
      components: [cluster, d.tPocket({ id: 't' }), d.frontPocket({ id: 'front' })],
    })
    const snapshot = structuredClone(source)
    const accessor = accessors.subProject(source)
    expect(accessor.optional.component.parent('t')).toBe(cluster)
    expect(accessor.optional.component.parent('front')).toBe(cluster)
    expect(accessor.optional.component.parent('cluster')).toBe(root)
    expect(accessor.component.parent('t')).toBe(cluster)
    expect(accessor.component.parent('front')).toBe(cluster)
    expect(accessor.component.parent('cluster')).toBe(root)
    expect(() => accessor.component.parent('root')).toThrow('Missing parent')
    expect(() => accessor.component.parent('missing')).toThrow('Missing parent')
    expect(accessor.optional.component.parent('root')).toBeUndefined()
    expect(accessor.optional.component.parent('missing')).toBeUndefined()
    expect(source).toEqual(snapshot)
  })

  it('returns the supported component types and leaves wrong or missing IDs unmatched', () => {
    const subProject = d.subProject({
      id: 'sub',
      root: d.rootPanel({ id: 'root', children: ['panel', 'cluster'] }),
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
