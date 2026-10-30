import { describe, expect, it } from 'vitest'
import { getComputedSubProject } from '../../logic/getComputedSubProject'
import { d } from '../../testData'
import { accessors } from './index'

describe('ComputedStitchLineAccessor', () => {
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
    const project = d.project({ id: 'project', subProjects: [subProject] })
    const computed = getComputedSubProject(subProject, project.stitchingSettings)
    const snapshot = structuredClone(computed)
    const accessor = accessors.computedSubProject(computed)
    expect(accessor.stitchLine.byId('first')).toBe(computed.stitchLines.first)
    expect(accessor.stitchLine.bounds('first')).toBe(computed.stitchLines.first)
    expect(accessor.stitchLine.tPocket('shared')).toBe(computed.stitchLines.shared)
    expect(accessor.optional.stitchLine.bounds('shared')).toBeUndefined()
    expect(accessor.optional.stitchLine.tPocket('first')).toBeUndefined()
    expect(accessor.optional.stitchLine.byId('missing')).toBeUndefined()
    expect(() => accessor.stitchLine.byId('missing')).toThrow('Missing stitch line')
    expect(() => accessor.stitchLine.bounds('shared')).toThrow('Missing component bounds stitch line')
    expect(() => accessor.stitchLine.tPocket('first')).toThrow('Missing t-pocket stitch line')
    expect(computed).toEqual(snapshot)
    expect(accessor.stitchLine.byOwner('panel')).toEqual([
      computed.stitchLines.first,
      computed.stitchLines.second,
      computed.stitchLines.fallback,
    ])
    expect(accessor.stitchLine.byOnTop('root')).toEqual([computed.stitchLines.first, computed.stitchLines.second])
    expect(accessor.stitchLine.byOnTop('panel')).toEqual([computed.stitchLines.fallback])
    expect(accessor.stitchLine.byOwner('cluster')).toEqual([computed.stitchLines.shared])
    expect(accessor.stitchLine.byOwner('hole')).toEqual([])
    expect(accessor.stitchLine.byOwner('missing')).toEqual([])
    expect(accessor.optional.stitchLine.byOnTop('missing')).toEqual([])
  })
})
