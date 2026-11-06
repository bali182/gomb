import { describe, expect, it } from 'vitest'
import { d } from '../../testData'
import { EN } from '../../translations/en'
import { NameGenerator } from '../../utils/factory/NameGenerator'
import { cloneComponentTree } from './cloneComponentTree'
import { getCloneIdMappings } from './utils/getCloneIdMappings'

const nameGenerator = new NameGenerator(EN.defaultNames)

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
    const idMappings = getCloneIdMappings(source)
    const result = cloneComponentTree({
      subProject: source,
      componentId: 'cluster',
      idMappings,
      nameGenerator,
      preserveNames: false,
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
    const idMappings = getCloneIdMappings(source)
    const result = cloneComponentTree({
      subProject: source,
      componentId: 'panel',
      idMappings,
      nameGenerator,
      preserveNames: false,
      settings: { cloneComponentTree: true, cloneHoles: true, cloneStitchLines: true },
    })
    expect(idMappings.outside).toMatch(/^panel-/)
    expect(result?.clonedComponents[idMappings.panel].children).toEqual([idMappings.child])
    expect(result?.clonedHoles).toMatchObject([{ id: idMappings.hole, componentId: idMappings.child }])
    expect(result?.clonedStitchLines).toMatchObject([
      { id: idMappings.internal, targetId: idMappings.panel, onTop: idMappings.child },
      { id: idMappings.external, targetId: idMappings.hole, onTop: undefined },
    ])
    expect(source).toEqual(snapshot)
  })

  it.each([false, true])('handles component, hole and stitch names with preserveNames=%s', (preserveNames) => {
    const source = d.subProject({
      id: 'sub',
      root: d.rootPanel({ id: 'root', children: ['panel'] }),
      components: [
        d.panel({ id: 'panel', name: 'Shared 1', children: ['child'] }),
        d.panel({ id: 'child', name: 'Shared 1' }),
      ],
      holes: [
        d.hole({ id: 'first-hole', componentId: 'panel', name: 'Shared 1' }),
        d.hole({ id: 'second-hole', componentId: 'child', name: 'Shared 1' }),
      ],
      stitchLines: [
        d.componentBoundsStitchLine({
          id: 'first-stitch',
          targetId: 'panel',
          targetType: 'component',
          name: 'Shared 1',
        }),
        d.componentBoundsStitchLine({
          id: 'second-stitch',
          targetId: 'child',
          targetType: 'component',
          name: 'Shared 1',
        }),
      ],
    })
    const snapshot = structuredClone(source)
    const result = cloneComponentTree({
      subProject: source,
      componentId: 'panel',
      idMappings: getCloneIdMappings(source),
      settings: { cloneComponentTree: true, cloneHoles: true, cloneStitchLines: true },
      nameGenerator,
      preserveNames,
    })
    const expectedNames = preserveNames ? ['Shared 1', 'Shared 1'] : ['Shared 2', 'Shared 3']
    expect(Object.values(result?.clonedComponents ?? {}).map((component) => component.name)).toEqual(expectedNames)
    expect(result?.clonedHoles.map((hole) => hole.name)).toEqual(expectedNames)
    expect(result?.clonedStitchLines.map((stitchLine) => stitchLine.name)).toEqual(expectedNames)
    expect(source).toEqual(snapshot)
  })

  it('copies an entire root tree', () => {
    const source = d.subProject({
      id: 'sub',
      root: d.rootPanel({ id: 'root', children: ['panel'] }),
      components: [d.panel({ id: 'panel' })],
    })
    const idMappings = getCloneIdMappings(source)
    const result = cloneComponentTree({
      subProject: source,
      componentId: 'root',
      idMappings,
      nameGenerator,
      preserveNames: false,
      settings: { cloneComponentTree: true, cloneHoles: true, cloneStitchLines: true },
    })
    expect(result?.clonedRootId).toBe(idMappings.root)
    expect(result?.clonedComponents[idMappings.root].children).toEqual([idMappings.panel])
  })
})
