import { describe, expect, it } from 'vitest'

import { getComputedSubProject } from '../logic/getComputedSubProject'
import { d } from '../testData'
import { accessors } from './accessors'

describe('computedSubProject accessor', () => {
  it('returns computed elements by their source identifiers', () => {
    const root = d.rootPanel({ id: 'root', children: ['panel', 'pocket-cluster'] })
    const panel = d.panel({ id: 'panel' })
    const pocketCluster = d.pocketCluster({ id: 'pocket-cluster' })
    const hole = d.hole({ id: 'hole', componentId: panel.id })
    const stitchLine = d.componentBoundsStitchLine({ id: 'stitch-line', targetId: panel.id, targetType: 'component' })
    const subProject = d.subProject({
      id: 'sub-project',
      root,
      components: [panel, pocketCluster],
      holes: [hole],
      stitchLines: [stitchLine],
    })
    const project = d.project({ id: 'project', subProjects: [subProject] })
    const computed = getComputedSubProject(subProject, project.stitchingSettings)
    const accessor = accessors.computedSubProject(computed)

    expect(accessor.component(panel.id)).toBe(computed.components[panel.id])
    expect(accessor.stitchLine(stitchLine.id).stitchLineId).toBe(stitchLine.id)
    expect(accessor.stitchLines(panel.id)).toBe(computed.stitchLines[panel.id])
    expect(accessor.stitchLines('missing-component')).toEqual([])
    expect(accessor.hole(hole.id).holeId).toBe(hole.id)
    expect(accessor.rootPanel().componentId).toBe(root.id)
    expect(accessor.panel(panel.id).componentId).toBe(panel.id)
    expect(accessor.pocketCluster(pocketCluster.id).componentId).toBe(pocketCluster.id)
  })

  it('throws when a computed element is missing', () => {
    const root = d.rootPanel({ id: 'root' })
    const subProject = d.subProject({ id: 'sub-project', root })
    const project = d.project({ id: 'project', subProjects: [subProject] })
    const accessor = accessors.computedSubProject(getComputedSubProject(subProject, project.stitchingSettings))

    expect(() => accessor.component('missing-component')).toThrow('Missing component')
    expect(() => accessor.stitchLine('missing-stitch-line')).toThrow('Missing stitch line')
    expect(() => accessor.hole('missing-hole')).toThrow('Missing hole')
  })

  it('throws when a computed component has an unexpected type', () => {
    const root = d.rootPanel({ id: 'root', children: ['panel', 'pocket-cluster'] })
    const panel = d.panel({ id: 'panel' })
    const pocketCluster = d.pocketCluster({ id: 'pocket-cluster' })
    const subProject = d.subProject({ id: 'sub-project', root, components: [panel, pocketCluster] })
    const project = d.project({ id: 'project', subProjects: [subProject] })
    const accessor = accessors.computedSubProject(getComputedSubProject(subProject, project.stitchingSettings))

    expect(() => accessor.panel(pocketCluster.id)).toThrow("Expected type='computed-panel'")
    expect(() => accessor.pocketCluster(panel.id)).toThrow("Expected type='computed-pocket-cluster'")
  })
})

describe('subProject relationship accessors', () => {
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
    expect(accessor.optional.parent('t')).toBe(cluster)
    expect(accessor.optional.parent('front')).toBe(cluster)
    expect(accessor.optional.parent('cluster')).toBe(root)
    expect(accessor.parent('t')).toBe(cluster)
    expect(accessor.parent('front')).toBe(cluster)
    expect(accessor.parent('cluster')).toBe(root)
    expect(() => accessor.parent('root')).toThrow('Missing parent')
    expect(() => accessor.parent('missing')).toThrow('Missing parent')
    expect(accessor.optional.parent('root')).toBeUndefined()
    expect(accessor.optional.parent('missing')).toBeUndefined()
    expect(accessor.optional.parent(undefined)).toBeUndefined()
    expect(source).toEqual(snapshot)
  })

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
    expect(accessor.tPocketStitchLines('cluster')).toEqual([shared, second])
    expect(accessor.tPocketStitchLines('t')).toEqual([local])
    expect(accessor.tPocketStitchLines('front')).toEqual([])
    expect(accessor.tPocketStitchLines('missing')).toEqual([])
    expect(accessor.tPocketStitchLines('cluster')[0]).toBe(shared)
    expect(source).toEqual(snapshot)
  })
})

describe('typed optional subproject accessors', () => {
  it('returns the supported component types and leaves wrong, missing and undefined IDs unmatched', () => {
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
    expect(optional.rootPanel()).toBe(subProject.components.root)
    expect(accessors.subProject({ ...subProject, root: 'missing' }).optional.rootPanel()).toBeUndefined()
    expect(accessors.subProject({ ...subProject, root: 'panel' }).optional.rootPanel()).toBeUndefined()
    for (const [id, getter, wrongId] of [
      ['panel', optional.panel, 'cluster'],
      ['cluster', optional.pocketCluster, 'panel'],
      ['front', optional.frontPocket, 'panel'],
      ['t', optional.tPocket, 'front'],
      ['front', optional.pocket, 'panel'],
      ['t', optional.pocket, 'panel'],
    ] as const) {
      expect(getter(id)).toBe(subProject.components[id])
      expect(getter(wrongId)).toBeUndefined()
      expect(getter('missing')).toBeUndefined()
      expect(getter(undefined)).toBeUndefined()
    }
    expect(subProject).toEqual(snapshot)
  })

  it.each([false, true])('matches stitch type and ID together regardless of array order: %s', (reverse) => {
    const bounds = d.componentBoundsStitchLine({ id: 'shared', targetId: 'root', targetType: 'component' })
    const pocket = d.tPocketStitchLine({ id: 'shared', targetId: 't', targetType: 'component' })
    const subProject = d.subProject({
      id: 'sub',
      root: d.rootPanel({ id: 'root' }),
      stitchLines: reverse ? [pocket, bounds] : [bounds, pocket],
    })
    const snapshot = structuredClone(subProject)
    const accessor = accessors.subProject(subProject)
    expect(accessor.optional.componentBoundsStitchLine('shared')).toBe(bounds)
    expect(accessor.optional.tPocketStitchLine('shared')).toBe(pocket)
    expect(accessor.componentBoundsStitchLine('shared')).toBe(bounds)
    expect(accessor.tPocketStitchLine('shared')).toBe(pocket)
    expect(accessor.optional.componentBoundsStitchLine(undefined)).toBeUndefined()
    expect(accessor.optional.tPocketStitchLine(undefined)).toBeUndefined()
    expect(accessor.optional.componentBoundsStitchLine('missing')).toBeUndefined()
    expect(accessor.optional.tPocketStitchLine('missing')).toBeUndefined()
    expect(() => accessor.componentBoundsStitchLine('missing')).toThrow('Missing component bounds stitch line')
    expect(() => accessor.tPocketStitchLine('missing')).toThrow('Missing T-pocket stitch line')
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
    expect(accessor.optional.tPocketStitchLine('bounds')).toBeUndefined()
    expect(accessor.optional.componentBoundsStitchLine('pocket')).toBeUndefined()
    expect(() => accessor.tPocketStitchLine('bounds')).toThrow('Missing T-pocket stitch line')
    expect(() => accessor.componentBoundsStitchLine('pocket')).toThrow('Missing component bounds stitch line')
  })
})

describe('optional computed accessors', () => {
  it('finds components, holes and source stitch IDs even when stitching is drawn on another component', () => {
    const subProject = d.subProject({
      id: 'sub',
      root: d.rootPanel({ id: 'root', children: ['panel'] }),
      components: [d.panel({ id: 'panel' })],
      holes: [d.hole({ id: 'hole', componentId: 'panel' })],
      stitchLines: [
        d.componentBoundsStitchLine({ id: 'line', targetId: 'panel', targetType: 'component', onTop: 'root' }),
      ],
    })
    const project = d.project({ id: 'project', subProjects: [subProject] })
    const computed = getComputedSubProject(subProject, project.stitchingSettings)
    const accessor = accessors.computedSubProject(computed)
    expect(accessor.optional.component('panel')).toBe(computed.components.panel)
    expect(accessor.optional.hole('hole')).toBe(computed.holes[0])
    expect(accessor.optional.stitchLine('line')).toBe(computed.stitchLines.root[0])
    expect(accessor.stitchLine('line')).toBe(accessor.optional.stitchLine('line'))
    for (const getter of [accessor.optional.component, accessor.optional.hole, accessor.optional.stitchLine]) {
      expect(getter(undefined)).toBeUndefined()
      expect(getter('missing')).toBeUndefined()
    }
  })
})

describe('project subproject accessors', () => {
  it('keeps source lookups optional and computed lookups mandatory', () => {
    const subProject = d.subProject({ id: 'sub', root: d.rootPanel({ id: 'root' }) })
    const project = d.project({ id: 'project', subProjects: [subProject] })
    const snapshot = structuredClone(project)
    const computed = getComputedSubProject(subProject, project.stitchingSettings)
    const accessor = accessors.project(project)
    const computedAccessor = accessors.computedProject({ id: project.id, name: project.name, subProjects: [computed] })
    expect(accessor.optional.subProject(subProject.id)).toBe(subProject)
    expect(accessor.optional.subProject('missing')).toBeUndefined()
    expect(accessor.optional.subProject(undefined)).toBeUndefined()
    expect(computedAccessor.subProject(subProject.id)).toBe(computed)
    expect(() => computedAccessor.subProject('missing')).toThrow('Missing sub-project from computed project')
    expect(project).toEqual(snapshot)
  })
})
