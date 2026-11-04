import { describe, expect, it } from 'vitest'
import { defaultStitchingSettings } from '../../defaultStates'
import { getComputedSubProject } from '../../logic/getComputedSubProject'
import { d } from '../../testData'
import { accessors } from '../../utils/accessors'
import { getProjectIds } from '../../utils/getProjectIds'
import { IdGenerator } from '../../utils/random/IdGenerator'
import { cloneComponent } from './cloneComponent'
import { getUnusedName } from './utils/getUnusedName'

const names = { component: getUnusedName, hole: getUnusedName, stitchLine: getUnusedName }
const settings = { cloneComponentTree: true, cloneHoles: true, cloneStitchLines: true }
const fixture = () =>
  d.subProject({
    id: 'sub',
    root: d.rootPanel({ id: 'root', children: ['panel', 'outside'] }),
    components: [
      d.panel({ id: 'panel', children: ['child'], name: 'Shared' }),
      d.panel({ id: 'child', name: 'Shared' }),
      d.panel({ id: 'outside' }),
    ],
    holes: ['panel', 'child', 'outside'].map((componentId) =>
      d.hole({ id: `hole-${componentId}`, componentId, name: 'Shared' }),
    ),
    stitchLines: ['panel', 'child', 'outside'].flatMap((targetId) => [
      d.componentBoundsStitchLine({ id: `stitch-${targetId}`, targetId, targetType: 'component', name: 'Shared' }),
      d.componentBoundsStitchLine({
        id: `stitch-hole-${targetId}`,
        targetId: `hole-${targetId}`,
        targetType: 'hole',
        name: 'Shared',
      }),
    ]),
  })

describe('cloneComponent', () => {
  it.each([
    [false, false, false],
    [false, false, true],
    [false, true, false],
    [false, true, true],
    [true, false, false],
    [true, false, true],
    [true, true, false],
    [true, true, true],
  ])(
    'selects descendants, holes and stitches independently: %s/%s/%s',
    (cloneComponentTree, cloneHoles, cloneStitchLines) => {
      const source = fixture()
      const snapshot = structuredClone(source)
      const project = d.project({ id: 'project', subProjects: [source] })
      const sourceIds = getProjectIds(project)
      const result = cloneComponent(source, {
        componentId: 'panel',
        names,
        idGenerator: new IdGenerator(sourceIds),
        settings: { cloneComponentTree, cloneHoles, cloneStitchLines },
      })
      const copyId = result.components.root.children[1]
      const copy = result.components[copyId]
      const componentCount = cloneComponentTree ? 2 : 1
      expect(result.components.root.children).toEqual(['panel', copyId, 'outside'])
      expect(copy.id).toMatch(/^component-/)
      expect(copy.children).toHaveLength(cloneComponentTree ? 1 : 0)
      expect(Object.keys(result.components)).toHaveLength(Object.keys(source.components).length + componentCount)
      expect(result.holes).toHaveLength(source.holes.length + (cloneHoles ? componentCount : 0))
      expect(result.stitchLines).toHaveLength(
        source.stitchLines.length + (cloneStitchLines ? componentCount * (cloneHoles ? 2 : 1) : 0),
      )
      const copies = [copyId, ...copy.children]
      const copiedHoles = result.holes.slice(source.holes.length)
      expect(copiedHoles.map((hole) => hole.componentId)).toEqual(cloneHoles ? copies : [])
      const targets = new Set([...copies, ...copiedHoles.map((hole) => hole.id)])
      for (const stitchLine of result.stitchLines.slice(source.stitchLines.length)) {
        expect(stitchLine.id).toMatch(/^stitch-line-/)
        expect(targets.has(stitchLine.targetId)).toBe(true)
      }
      for (const id of getProjectIds({ subProjects: [result] })) {
        if (!getProjectIds({ subProjects: [source] }).has(id)) {
          expect(sourceIds.has(id)).toBe(false)
        }
      }
      expect(source).toEqual(snapshot)
    },
  )

  it('reserves names for every copied entity', () => {
    const source = fixture()
    const result = cloneComponent(source, { componentId: 'panel', names, settings, idGenerator: new IdGenerator() })
    const copy = result.components[result.components.root.children[1]]
    expect(copy.name).toBe('Shared 1')
    expect(result.components[copy.children[0]].name).toBe('Shared 2')
    expect(result.holes.slice(-2).map((hole) => hole.name)).toEqual(['Shared 1', 'Shared 2'])
    expect(result.stitchLines.slice(-4).map((stitchLine) => stitchLine.name)).toEqual([
      'Shared 1',
      'Shared 2',
      'Shared 3',
      'Shared 4',
    ])
  })

  it.each(['root', 'missing'])('does not clone %s', (componentId) => {
    const source = fixture()
    expect(cloneComponent(source, { componentId, names, settings, idGenerator: new IdGenerator() })).toBe(source)
  })

  it.each(['missing', 'panel'])('does not clone an invalid tree referencing %s', (childId) => {
    const source = fixture()
    source.components.child.children = [childId]
    expect(cloneComponent(source, { componentId: 'panel', names, settings, idGenerator: new IdGenerator() })).toBe(
      source,
    )
  })

  it('copies a cluster tree and preserves the shared opening references', () => {
    const source = d.subProject({
      id: 'sub',
      root: d.rootPanel({ id: 'root', children: ['cluster'] }),
      components: [
        d.pocketCluster({ id: 'cluster', children: ['t', 'front'] }),
        d.tPocket({ id: 't', openingId: 'opening' }),
        d.frontPocket({ id: 'front', openingId: 'opening' }),
      ],
      stitchLines: [
        d.tPocketStitchLine({ id: 'shared', targetId: 'cluster', targetType: 'component' }),
        d.tPocketStitchLine({ id: 'local', targetId: 't', targetType: 'component' }),
      ],
    })
    const result = cloneComponent(source, { componentId: 'cluster', names, settings, idGenerator: new IdGenerator() })
    const accessor = accessors.subProject(result)
    const cluster = accessor.component.pocketCluster(result.components.root.children[1])
    expect(accessor.component.tPocket(cluster.children[0]).openingId).toBe('opening')
    expect(accessor.component.frontPocket(cluster.children[1]).openingId).toBe('opening')
    expect(result.pocketOpenings).toBe(source.pocketOpenings)
    expect(result.stitchLines.slice(-2).map((stitchLine) => stitchLine.targetId)).toEqual([
      cluster.id,
      cluster.children[0],
    ])

    const pocketCopy = cloneComponent(source, { componentId: 't', names, settings, idGenerator: new IdGenerator() })
    const copyId = pocketCopy.components.cluster.children[1]
    expect(pocketCopy.stitchLines).toHaveLength(3)
    expect(pocketCopy.stitchLines[0]).toBe(source.stitchLines[0])
    expect(pocketCopy.stitchLines[2].targetId).toBe(copyId)
    const computed = accessors.computedSubProject(getComputedSubProject(pocketCopy, defaultStitchingSettings))
    expect(computed.stitchLine.byId('shared').routes.map((route) => route.targetId)).toEqual(['t', copyId])
  })
})
