import { describe, expect, it } from 'vitest'
import { getComputedSubProject } from '../../logic/getComputedSubProject'
import { d } from '../../testData'
import { accessors } from './index'

describe('ComputedComponentAccessor', () => {
  it('indexes parents and supports every typed component lookup', () => {
    const subProject = d.subProject({
      id: 'sub',
      root: d.rootPanel({ id: 'root', children: ['panel'] }),
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
    expect(parent('panel')).toBe(computed.components.root)
    expect(accessor.optional.component.parent('root')).toBeUndefined()
    expect(accessor.optional.component.parent('missing')).toBeUndefined()
    expect(() => parent('root')).toThrow('Missing parent')
    expect(computed).toEqual(snapshot)
  })
})
