import { beforeEach, describe, expect, it } from 'vitest'

import type { SubProjectSchema } from '../../schemas/subProject'
import { d } from '../../testData'
import { cloneComponent } from './cloneComponent'
import type {
  CloneComponentIdGenerators,
  CloneComponentNameGenerators,
  CloneComponentSettings,
} from './cloneComponentTree'
import { getUnusedName } from './utils/getUnusedName'

const fullSettings: CloneComponentSettings = {
  cloneComponentTree: true,
  cloneHoles: true,
  cloneStitchLines: true,
}

const cloneComponentNames: CloneComponentNameGenerators = {
  component: getUnusedName,
  hole: getUnusedName,
  stitchLine: getUnusedName,
}

describe('cloneComponent', () => {
  let ids: CloneComponentIdGenerators
  let subProject: SubProjectSchema

  beforeEach(() => {
    let componentCounter = 0
    let holeCounter = 0
    let stitchLineCounter = 0

    ids = {
      component: (): string => {
        componentCounter += 1
        return `component-clone-${componentCounter}`
      },
      hole: (): string => {
        holeCounter += 1
        return `hole-clone-${holeCounter}`
      },
      stitchLine: (): string => {
        stitchLineCounter += 1
        return `stitch-line-clone-${stitchLineCounter}`
      },
    }

    const root = d.rootPanel({ id: 'root', children: ['panel', 'outside'], name: 'Root' })
    const panel = d.panel({ id: 'panel', children: ['child'], name: 'Panel' })
    const child = d.panel({ id: 'child', name: 'Child' })
    const outside = d.panel({ id: 'outside', name: 'Outside' })
    const panelHole = d.hole({ id: 'hole-panel', componentId: panel.id, name: 'Hole panel' })
    const childHole = d.hole({ id: 'hole-child', componentId: child.id, name: 'Hole child' })
    const outsideHole = d.hole({ id: 'hole-outside', componentId: outside.id, name: 'Hole outside' })

    subProject = d.subProject({
      components: [panel, child, outside],
      holes: [panelHole, childHole, outsideHole],
      id: 'sub-project',
      root,
      stitchLines: [
        d.componentBoundsStitchLine({
          id: 'stitch-panel',
          name: 'Stitch panel',
          targetId: panel.id,
          targetType: 'component',
        }),
        d.componentBoundsStitchLine({
          id: 'stitch-child',
          name: 'Stitch child',
          targetId: child.id,
          targetType: 'component',
        }),
        d.componentBoundsStitchLine({
          id: 'stitch-outside',
          name: 'Stitch outside',
          targetId: outside.id,
          targetType: 'component',
        }),
        d.componentBoundsStitchLine({
          id: 'stitch-hole-panel',
          name: 'Stitch hole panel',
          targetId: panelHole.id,
          targetType: 'hole',
        }),
        d.componentBoundsStitchLine({
          id: 'stitch-hole-child',
          name: 'Stitch hole child',
          targetId: childHole.id,
          targetType: 'hole',
        }),
        d.componentBoundsStitchLine({
          id: 'stitch-hole-outside',
          name: 'Stitch hole outside',
          targetId: outsideHole.id,
          targetType: 'hole',
        }),
      ],
    })
  })

  it('clones a component tree and every related hole and stitch line', () => {
    const result = cloneComponent(subProject, {
      componentId: 'panel',
      ids,
      names: cloneComponentNames,
      settings: fullSettings,
    })

    expect(result.components.root).toMatchObject({ children: ['panel', 'component-clone-1', 'outside'] })
    expect(result.components['component-clone-1']).toMatchObject({ children: ['component-clone-2'] })
    expect(result.holes.slice(-2)).toMatchObject([
      { componentId: 'component-clone-1', id: 'hole-clone-1' },
      { componentId: 'component-clone-2', id: 'hole-clone-2' },
    ])
    expect(result.stitchLines.slice(-4)).toMatchObject([
      { id: 'stitch-line-clone-1', targetId: 'component-clone-1', targetType: 'component' },
      { id: 'stitch-line-clone-2', targetId: 'component-clone-2', targetType: 'component' },
      { id: 'stitch-line-clone-3', targetId: 'hole-clone-1', targetType: 'hole' },
      { id: 'stitch-line-clone-4', targetId: 'hole-clone-2', targetType: 'hole' },
    ])
  })

  it('clones a pocket cluster and its child tree', () => {
    const root = d.rootPanel({ id: 'root', children: ['pocket-cluster'], name: 'Root' })
    const pocketCluster = d.pocketCluster({ id: 'pocket-cluster', children: ['panel'], name: 'Pocket cluster' })
    const panel = d.panel({ id: 'panel', name: 'Panel' })
    const clusterSubProject = d.subProject({
      components: [pocketCluster, panel],
      id: 'sub-project',
      root,
    })

    const result = cloneComponent(clusterSubProject, {
      componentId: pocketCluster.id,
      ids,
      names: cloneComponentNames,
      settings: fullSettings,
    })

    expect(result.components.root).toMatchObject({ children: ['pocket-cluster', 'component-clone-1'] })
    expect(result.components['component-clone-1']).toMatchObject({ children: ['component-clone-2'] })
  })

  it('clones only the root component and its related entities when tree cloning is disabled', () => {
    const result = cloneComponent(subProject, {
      componentId: 'panel',
      ids,
      names: cloneComponentNames,
      settings: { cloneComponentTree: false, cloneHoles: true, cloneStitchLines: true },
    })

    expect(result.components['component-clone-1']).toMatchObject({ children: [] })
    expect(result.components['component-clone-2']).toBeUndefined()
    expect(result.holes.slice(-1)).toMatchObject([{ componentId: 'component-clone-1', id: 'hole-clone-1' }])
    expect(result.stitchLines.slice(-2)).toMatchObject([
      { targetId: 'component-clone-1', targetType: 'component' },
      { targetId: 'hole-clone-1', targetType: 'hole' },
    ])
  })

  it('does not clone hole targets when hole cloning is disabled', () => {
    const result = cloneComponent(subProject, {
      componentId: 'panel',
      ids,
      names: cloneComponentNames,
      settings: { cloneComponentTree: true, cloneHoles: false, cloneStitchLines: true },
    })

    expect(result.holes).toHaveLength(3)
    expect(result.stitchLines.slice(-2)).toMatchObject([
      { targetId: 'component-clone-1', targetType: 'component' },
      { targetId: 'component-clone-2', targetType: 'component' },
    ])
  })

  it('does not clone stitch lines when stitch line cloning is disabled', () => {
    const result = cloneComponent(subProject, {
      componentId: 'panel',
      ids,
      names: cloneComponentNames,
      settings: { cloneComponentTree: true, cloneHoles: true, cloneStitchLines: false },
    })

    expect(result.holes).toHaveLength(5)
    expect(result.stitchLines).toHaveLength(6)
  })

  it('reserves generated names before adding clones to the subproject', () => {
    subProject.components.child.name = 'Shared'
    subProject.components.panel.name = 'Shared'
    subProject.holes[0].name = 'Shared'
    subProject.holes[1].name = 'Shared'
    subProject.stitchLines[0].name = 'Shared'
    subProject.stitchLines[1].name = 'Shared'

    const result = cloneComponent(subProject, {
      componentId: 'panel',
      ids,
      names: cloneComponentNames,
      settings: fullSettings,
    })

    expect(result.components['component-clone-1'].name).toBe('Shared 1')
    expect(result.components['component-clone-2'].name).toBe('Shared 2')
    expect(result.holes.slice(-2).map((hole) => hole.name)).toEqual(['Shared 1', 'Shared 2'])
    expect(result.stitchLines.slice(-4, -2).map((stitchLine) => stitchLine.name)).toEqual(['Shared 1', 'Shared 2'])
  })

  it('does not clone a root panel or a missing component', () => {
    expect(
      cloneComponent(subProject, { componentId: 'root', ids, names: cloneComponentNames, settings: fullSettings }),
    ).toBe(subProject)
    expect(
      cloneComponent(subProject, { componentId: 'missing', ids, names: cloneComponentNames, settings: fullSettings }),
    ).toBe(subProject)
  })

  it('does not clone an invalid component tree', () => {
    subProject.components.panel = d.panel({ id: 'panel', children: ['missing-child'], name: 'Panel' })

    expect(
      cloneComponent(subProject, { componentId: 'panel', ids, names: cloneComponentNames, settings: fullSettings }),
    ).toBe(subProject)
  })
})
