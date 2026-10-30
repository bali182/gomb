import { describe, expect, it } from 'vitest'

import { defaultStitchingSettings } from '../../defaultStates'
import { getComputedSubProject } from '../../logic/getComputedSubProject'
import { d } from '../../testData'
import { accessors } from '../../utils/accessors'
import { cloneSubProject } from './cloneSubProject'

describe('cloneSubProject', () => {
  it('builds a complete cloned subproject from the component tree result', () => {
    const root = d.rootPanel({ id: 'root', children: ['panel'], name: 'Wallet' })
    const panel = d.panel({ id: 'panel', name: 'Panel' })
    const hole = d.hole({ id: 'hole', componentId: panel.id, name: 'Hole' })
    const stitchLine = d.componentBoundsStitchLine({
      id: 'stitch-line',
      name: 'Stitch line',
      targetId: hole.id,
      targetType: 'hole',
    })
    const sourceSubProject = d.subProject({
      components: [panel],
      holes: [hole],
      id: 'source-sub-project',
      root,
      stitchLines: [stitchLine],
    })
    const existingRoot = d.rootPanel({ id: 'existing-root', name: 'Wallet 1' })
    const existingSubProject = d.subProject({ id: 'existing-sub-project', root: existingRoot })
    const project = d.project({ id: 'project', subProjects: [sourceSubProject, existingSubProject] })
    let idCounter = 0

    const result = cloneSubProject(project, {
      getUnusedId: (): string => {
        idCounter += 1
        return `clone-${idCounter}`
      },
      subProject: sourceSubProject,
    })
    const clonedSubProject = result.subProjects[result.subProjects.length - 1]

    expect(clonedSubProject).toMatchObject({ id: 'clone-5', root: 'clone-1' })
    expect(clonedSubProject?.components['clone-1']).toMatchObject({ children: ['clone-2'], name: 'Wallet 2' })
    expect(clonedSubProject?.holes).toMatchObject([{ componentId: 'clone-2', id: 'clone-3' }])
    expect(clonedSubProject?.stitchLines).toMatchObject([{ id: 'clone-4', targetId: 'clone-3', targetType: 'hole' }])
  })
  it('remaps cluster and pocket stitch owners while retaining one computed object per source', () => {
    const source = d.subProject({
      id: 'sub',
      root: d.rootPanel({ id: 'root', children: ['cluster'] }),
      components: [
        d.pocketCluster({ id: 'cluster', children: ['t', 'front'] }),
        d.tPocket({ id: 't' }),
        d.frontPocket({ id: 'front' }),
      ],
      stitchLines: [
        d.tPocketStitchLine({ id: 'shared', targetId: 'cluster', targetType: 'component' }),
        d.tPocketStitchLine({ id: 'local', targetId: 't', targetType: 'component' }),
      ],
    })
    const project = d.project({ id: 'project', subProjects: [source] })
    const snapshot = structuredClone(project)
    let count = 0
    const result = cloneSubProject(project, { subProject: source, getUnusedId: () => `copy-${++count}` })
    const cloned = result.subProjects[1]
    const accessor = accessors.subProject(cloned)
    const clusterId = accessor.component.rootPanel().children[0]
    const pocketId = accessor.component.pocketCluster(clusterId).children[0]
    expect(cloned.stitchLines).toHaveLength(2)
    expect(cloned.stitchLines.map((line) => line.targetId)).toEqual([clusterId, pocketId])
    const computed = getComputedSubProject(cloned, defaultStitchingSettings)
    expect(Object.values(computed.stitchLines).flat()).toHaveLength(2)
    expect(accessors.computedSubProject(computed).stitchLine.byId(cloned.stitchLines[0].id).routes[0].targetId).toBe(
      pocketId,
    )
    expect(project).toEqual(snapshot)
  })
})
