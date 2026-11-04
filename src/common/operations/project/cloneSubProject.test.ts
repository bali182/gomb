import { describe, expect, it } from 'vitest'
import { getProjectIds } from '../../utils/getProjectIds'
import { IdGenerator } from '../../utils/random/IdGenerator'

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

    const result = cloneSubProject(project, {
      idGenerator: new IdGenerator(getProjectIds(project)),
      subProject: sourceSubProject,
    })
    const clonedSubProject = result.subProjects[result.subProjects.length - 1]

    const copiedRoot = clonedSubProject.components[clonedSubProject.root]
    const copiedPanelId = copiedRoot.children[0]
    const copiedHole = clonedSubProject.holes[0]
    expect(clonedSubProject.id).toMatch(/^sub-project-/)
    expect(copiedRoot).toMatchObject({ id: expect.stringMatching(/^component-/), name: 'Wallet 2' })
    expect(copiedHole).toMatchObject({ componentId: copiedPanelId, id: expect.stringMatching(/^hole-/) })
    expect(clonedSubProject.stitchLines).toMatchObject([
      { id: expect.stringMatching(/^stitch-line-/), targetId: copiedHole.id, targetType: 'hole' },
    ])
    const originalIds = getProjectIds(project)
    for (const id of getProjectIds({ subProjects: [clonedSubProject] })) {
      expect(originalIds.has(id)).toBe(false)
    }
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
    const result = cloneSubProject(project, {
      subProject: source,
      idGenerator: new IdGenerator(getProjectIds(project)),
    })
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

it('maps onTop references inside a full subproject clone', () => {
  const source = d.subProject({
    id: 'sub',
    root: d.rootPanel({ id: 'root', children: ['panel'] }),
    components: [d.panel({ id: 'panel' })],
    stitchLines: [
      d.componentBoundsStitchLine({ id: 'stitch', targetId: 'panel', targetType: 'component', onTop: 'root' }),
    ],
  })
  const project = d.project({ id: 'project', subProjects: [source] })
  const cloned = cloneSubProject(project, { subProject: source, idGenerator: new IdGenerator(getProjectIds(project)) })
    .subProjects[1]
  expect(cloned.stitchLines[0]).toMatchObject({
    targetId: cloned.components[cloned.root].children[0],
    onTop: cloned.root,
  })
})

it.each(['missing-root', 'missing-child', 'cycle'])('does not clone an invalid subproject: %s', (invalidity) => {
  const source = d.subProject({
    id: 'sub',
    root: d.rootPanel({ id: 'root', children: ['panel'] }),
    components: [d.panel({ id: 'panel' })],
  })
  if (invalidity === 'missing-root') {
    source.root = 'missing'
  } else {
    source.components.panel.children = [invalidity === 'cycle' ? 'root' : 'missing']
  }
  const project = d.project({ id: 'project', subProjects: [source] })
  expect(cloneSubProject(project, { subProject: source, idGenerator: new IdGenerator() })).toBe(project)
})
