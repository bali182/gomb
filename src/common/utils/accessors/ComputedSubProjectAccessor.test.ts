import { describe, expect, it } from 'vitest'
import { getComputedSubProject } from '../../logic/getComputedSubProject'
import { d } from '../../testData'
import { accessors } from './index'

describe('ComputedSubProjectAccessor', () => {
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

    expect(accessor.component.byId(panel.id)).toBe(computed.components[panel.id])
    expect(accessor.stitchLine.byId(stitchLine.id).stitchLineId).toBe(stitchLine.id)
    expect(accessor.stitchLine.byOnTop(panel.id)).toEqual([computed.stitchLines[stitchLine.id]])
    expect(accessor.stitchLine.byOnTop('missing-component')).toEqual([])
    expect(accessor.hole.byId(hole.id).holeId).toBe(hole.id)
    expect(accessor.component.rootPanel().componentId).toBe(root.id)
    expect(accessor.component.panel(panel.id).componentId).toBe(panel.id)
    expect(accessor.component.pocketCluster(pocketCluster.id).componentId).toBe(pocketCluster.id)
  })

  it('throws when a computed element is missing', () => {
    const root = d.rootPanel({ id: 'root' })
    const subProject = d.subProject({ id: 'sub-project', root })
    const project = d.project({ id: 'project', subProjects: [subProject] })
    const accessor = accessors.computedSubProject(getComputedSubProject(subProject, project.stitchingSettings))

    expect(() => accessor.component.byId('missing-component')).toThrow('Missing component')
    expect(() => accessor.stitchLine.byId('missing-stitch-line')).toThrow('Missing stitch line')
    expect(() => accessor.hole.byId('missing-hole')).toThrow('Missing hole')
  })

  it('throws when a computed component has an unexpected type', () => {
    const root = d.rootPanel({ id: 'root', children: ['panel', 'pocket-cluster'] })
    const panel = d.panel({ id: 'panel' })
    const pocketCluster = d.pocketCluster({ id: 'pocket-cluster' })
    const subProject = d.subProject({ id: 'sub-project', root, components: [panel, pocketCluster] })
    const project = d.project({ id: 'project', subProjects: [subProject] })
    const accessor = accessors.computedSubProject(getComputedSubProject(subProject, project.stitchingSettings))

    expect(() => accessor.component.panel(pocketCluster.id)).toThrow('Missing panel')
    expect(() => accessor.component.pocketCluster(panel.id)).toThrow('Missing pocket cluster')
  })

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
    expect(accessor.optional.component.byId('panel')).toBe(computed.components.panel)
    expect(accessor.optional.hole.byId('hole')).toBe(computed.holes.hole)
    expect(accessor.optional.stitchLine.byId('line')).toBe(computed.stitchLines.line)
    expect(accessor.stitchLine.byId('line')).toBe(accessor.optional.stitchLine.byId('line'))
    for (const getter of [
      accessor.optional.component.byId,
      accessor.optional.hole.byId,
      accessor.optional.stitchLine.byId,
    ]) {
      expect(getter('missing')).toBeUndefined()
    }
  })
})
