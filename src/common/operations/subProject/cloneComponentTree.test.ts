import { describe, expect, it } from 'vitest'
import { d } from '../../testData'
import { IdGenerator } from '../../utils/random/IdGenerator'
import { cloneComponentTree } from './cloneComponentTree'
import { getCloneIdMappings } from './utils/getCloneIdMappings'
import { getUnusedName } from './utils/getUnusedName'

const names = { component: getUnusedName, hole: getUnusedName, stitchLine: getUnusedName }

describe('cloneComponentTree', () => {
  it.each([false, true])('copies only the cluster when tree copying is disabled, with pockets: %s', (hasPockets) => {
    const source = d.subProject({
      id: 'sub',
      root: d.rootPanel({ id: 'root', children: ['cluster'] }),
      components: [
        d.pocketCluster({ id: 'cluster', children: hasPockets ? ['t', 'front'] : [] }),
        d.tPocket({ id: 't' }),
        d.frontPocket({ id: 'front' }),
      ],
      holes: [d.hole({ id: 'hole', componentId: 'front' })],
      stitchLines: [d.tPocketStitchLine({ id: 'stitch', targetId: 't', targetType: 'component' })],
    })
    const idMappings = getCloneIdMappings(source, new IdGenerator())
    const result = cloneComponentTree({
      subProject: source,
      componentId: 'cluster',
      idMappings,
      names,
      settings: { cloneComponentTree: false, cloneHoles: true, cloneStitchLines: true },
    })
    expect(Object.keys(result?.clonedComponents ?? {})).toEqual([idMappings.cluster])
    expect(result?.clonedComponents[idMappings.cluster]).toMatchObject({ children: [] })
    expect(result?.clonedHoles).toEqual([])
    expect(result?.clonedStitchLines).toEqual([])
  })

  it('maps internal onTop references and removes external ones even though both have mappings', () => {
    const source = d.subProject({
      id: 'sub',
      root: d.rootPanel({ id: 'root', children: ['panel', 'outside'] }),
      components: [d.panel({ id: 'panel', children: ['child'] }), d.panel({ id: 'child' }), d.panel({ id: 'outside' })],
      holes: [d.hole({ id: 'hole', componentId: 'child' })],
      stitchLines: [
        d.componentBoundsStitchLine({ id: 'internal', targetId: 'panel', targetType: 'component', onTop: 'child' }),
        d.componentBoundsStitchLine({ id: 'external', targetId: 'hole', targetType: 'hole', onTop: 'outside' }),
      ],
    })
    const snapshot = structuredClone(source)
    const idMappings = getCloneIdMappings(source, new IdGenerator())
    const result = cloneComponentTree({
      subProject: source,
      componentId: 'panel',
      idMappings,
      names,
      settings: { cloneComponentTree: true, cloneHoles: true, cloneStitchLines: true },
    })
    expect(idMappings.outside).toMatch(/^component-/)
    expect(result?.clonedComponents[idMappings.panel].children).toEqual([idMappings.child])
    expect(result?.clonedHoles).toMatchObject([{ id: idMappings.hole, componentId: idMappings.child }])
    expect(result?.clonedStitchLines).toMatchObject([
      { id: idMappings.internal, targetId: idMappings.panel, onTop: idMappings.child },
      { id: idMappings.external, targetId: idMappings.hole, onTop: undefined },
    ])
    expect(source).toEqual(snapshot)
  })

  it('copies an entire root tree', () => {
    const source = d.subProject({
      id: 'sub',
      root: d.rootPanel({ id: 'root', children: ['panel'] }),
      components: [d.panel({ id: 'panel' })],
    })
    const idMappings = getCloneIdMappings(source, new IdGenerator())
    const result = cloneComponentTree({
      subProject: source,
      componentId: 'root',
      idMappings,
      names,
      settings: { cloneComponentTree: true, cloneHoles: true, cloneStitchLines: true },
    })
    expect(result?.clonedRootId).toBe(idMappings.root)
    expect(result?.clonedComponents[idMappings.root].children).toEqual([idMappings.panel])
  })
})
