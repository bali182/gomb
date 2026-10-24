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
