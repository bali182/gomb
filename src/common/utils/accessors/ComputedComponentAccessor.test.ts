import { describe, expect, it } from 'vitest'
import { getComputedSubProject } from '../../logic/getComputedSubProject'
import { d } from '../../testData'
import { accessors } from './index'

describe('ComputedComponentAccessor', () => {
  it('resolves children in source order and handles missing references according to strictness', () => {
    const subProject = d.subProject({
      frontFace: d.rootPanelFace({ id: 'root-front', children: ['second', 'first'] }),
      id: 'sub',
      root: d.rootPanel({ id: 'root' }),
      components: [d.panel({ id: 'first' }), d.panel({ id: 'second' })],
    })
    const project = d.project({ id: 'project', subProjects: [subProject] })
    const computed = getComputedSubProject(subProject, project.stitchingSettings)
    const snapshot = structuredClone(computed)
    const accessor = accessors.computedSubProject(computed)
    const children = accessor.component.children
    const optionalChildren = accessor.optional.component.children
    const first = accessor.component.panel('first')
    const second = accessor.component.panel('second')

    expect(children('root-front')).toEqual([second, first])
    expect(children('root-front')[0]).toBe(second)
    expect(children('first')).toEqual([])
    expect(optionalChildren('root-front')).toEqual([second, first])
    expect(optionalChildren('missing')).toEqual([])
    expect(() => children('missing')).toThrow('Missing component')

    const incomplete = accessors.computedSubProject({
      ...computed,
      components: {
        ...computed.components,
        'root-front': { ...accessor.component.rootPanelFace('root-front'), children: ['second', 'missing', 'first'] },
      },
    })
    expect(incomplete.optional.component.children('root-front')).toEqual([second, first])
    expect(() => incomplete.component.children('root-front')).toThrow('Missing component')
    expect(computed).toEqual(snapshot)
  })

  it('indexes parents and supports every typed component lookup', () => {
    const subProject = d.subProject({
      frontFace: d.rootPanelFace({ id: 'root-front', children: ['panel'] }),
      id: 'sub',
      root: d.rootPanel({ id: 'root' }),
      components: [
        d.panel({ id: 'panel', children: ['cluster'] }),
        d.pocketCluster({ id: 'cluster', children: ['t', 'front'] }),
        d.tPocket({ id: 't' }),
        d.frontPocket({ id: 'front' }),
      ],
    })
    const project = d.project({ id: 'project', subProjects: [subProject] })
    const computed = getComputedSubProject(subProject, project.stitchingSettings)
    const snapshot = structuredClone(computed)
    const accessor = accessors.computedSubProject(computed)
    expect(accessor.component.rootPanelFace('root-front').children).toEqual(['panel'])
    expect(accessor.component.panel('panel').children).toEqual(['cluster'])
    expect(accessor.component.pocketCluster('cluster').children).toEqual(['t', 'front'])
    expect(accessor.component.tPocket('t').children).toEqual([])
    expect(accessor.component.frontPocket('front').children).toEqual([])
    expect(accessor.component.rootPanel()).toBe(computed.components.root)
    expect(accessor.component.rootPanel('root')).toBe(computed.components.root)
    for (const [id, getter, optionalGetter, wrongId] of [
      ['panel', accessor.component.panel, accessor.optional.component.panel, 'cluster'],
      ['cluster', accessor.component.pocketCluster, accessor.optional.component.pocketCluster, 'panel'],
      ['t', accessor.component.tPocket, accessor.optional.component.tPocket, 'front'],
      ['front', accessor.component.frontPocket, accessor.optional.component.frontPocket, 't'],
      ['t', accessor.component.pocket, accessor.optional.component.pocket, 'panel'],
      ['front', accessor.component.pocket, accessor.optional.component.pocket, 'panel'],
    ] as const) {
      expect(getter(id)).toBe(computed.components[id])
      expect(optionalGetter(id)).toBe(computed.components[id])
      expect(optionalGetter(wrongId)).toBeUndefined()
      expect(optionalGetter('missing')).toBeUndefined()
      expect(() => getter(wrongId)).toThrow('Missing')
    }
    const parent = accessor.component.parent
    expect(parent('t')).toBe(computed.components.cluster)
    expect(parent('cluster')).toBe(computed.components.panel)
    expect(parent('panel')).toBe(computed.components['root-front'])
    expect(accessor.optional.component.parent('root')).toBeUndefined()
    expect(accessor.optional.component.parent('missing')).toBeUndefined()
    expect(() => parent('root')).toThrow('Missing parent')
    expect(computed).toEqual(snapshot)
  })
})
