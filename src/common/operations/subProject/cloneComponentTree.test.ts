import { describe, expect, it } from 'vitest'

import { d } from '../../testData'
import { cloneComponentTree } from './cloneComponentTree'
import { getUnusedName } from './utils/getUnusedName'

describe('cloneComponentTree', () => {
  it.each([false, true])('clones a cluster without children when it originally has pockets: %s', (hasPockets) => {
    const cluster = d.pocketCluster({ id: 'cluster', children: hasPockets ? ['t', 'front'] : [] })
    const source = d.subProject({
      id: 'sub',
      root: d.rootPanel({ id: 'root', children: [cluster.id] }),
      components: [cluster, d.tPocket({ id: 't' }), d.frontPocket({ id: 'front' })],
      holes: [d.hole({ id: 'front-hole', componentId: 'front' })],
      stitchLines: [
        d.tPocketStitchLine({ id: 't-line', targetId: 't', targetType: 'component' }),
        d.componentBoundsStitchLine({ id: 'hole-line', targetId: 'front-hole', targetType: 'hole' }),
      ],
    })
    const snapshot = structuredClone(source)
    let componentCount = 0
    const result = cloneComponentTree({
      subProject: source,
      componentId: cluster.id,
      settings: { cloneComponentTree: false, cloneHoles: true, cloneStitchLines: true },
      ids: {
        component: () => `component-copy-${++componentCount}`,
        hole: () => 'hole-copy',
        stitchLine: () => 'stitch-copy',
      },
      names: { component: getUnusedName, hole: getUnusedName, stitchLine: getUnusedName },
    })
    expect(result?.clonedRootId).toBe('component-copy-1')
    expect(Object.keys(result?.clonedComponents ?? {})).toEqual(['component-copy-1'])
    expect(result?.clonedComponents['component-copy-1']).toMatchObject({ type: 'pocket-cluster', children: [] })
    expect(result?.clonedHoles).toEqual([])
    expect(result?.clonedStitchLines).toEqual([])
    expect(source).toEqual(snapshot)
  })

  it('clones a root tree with its holes and stitch lines', () => {
    const root = d.rootPanel({ id: 'root', children: ['pocket-cluster'], name: 'Root' })
    const pocketCluster = d.pocketCluster({ id: 'pocket-cluster', children: ['panel'], name: 'Pocket cluster' })
    const panel = d.panel({ id: 'panel', name: 'Panel' })
    const hole = d.hole({ id: 'hole', componentId: panel.id, name: 'Hole' })
    const componentStitchLine = d.componentBoundsStitchLine({
      id: 'component-stitch-line',
      name: 'Component stitch line',
      targetId: panel.id,
      targetType: 'component',
    })
    const holeStitchLine = d.componentBoundsStitchLine({
      id: 'hole-stitch-line',
      name: 'Hole stitch line',
      targetId: hole.id,
      targetType: 'hole',
    })
    const subProject = d.subProject({
      components: [pocketCluster, panel],
      holes: [hole],
      id: 'sub-project',
      root,
      stitchLines: [componentStitchLine, holeStitchLine],
    })
    let componentCounter = 0
    let holeCounter = 0
    let stitchLineCounter = 0

    const result = cloneComponentTree({
      subProject,
      componentId: root.id,
      settings: { cloneComponentTree: true, cloneHoles: true, cloneStitchLines: true },
      ids: {
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
      },
      names: {
        component: getUnusedName,
        hole: getUnusedName,
        stitchLine: getUnusedName,
      },
    })

    expect(result?.clonedRootId).toBe('component-clone-1')
    expect(result?.clonedComponents['component-clone-1']).toMatchObject({ children: ['component-clone-2'] })
    expect(result?.clonedComponents['component-clone-2']).toMatchObject({ children: ['component-clone-3'] })
    expect(result?.clonedHoles).toMatchObject([{ componentId: 'component-clone-3', id: 'hole-clone-1' }])
    expect(result?.clonedStitchLines).toMatchObject([
      { targetId: 'component-clone-3', targetType: 'component' },
      { targetId: 'hole-clone-1', targetType: 'hole' },
    ])
  })
})
