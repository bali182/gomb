import { describe, expect, it } from 'vitest'
import { defaultOpticalIllusionPocketOpening, defaultStitchingSettings } from '../../defaultStates'
import { getComputedSubProject } from '../../logic/getComputedSubProject'
import { d } from '../../testData'
import { EN } from '../../translations/en'
import { accessors } from '../../utils/accessors'
import { NameGenerator } from '../../utils/factory/NameGenerator'
import { narrowers } from '../../utils/narrowers'
import { cloneComponent } from './cloneComponent'
import { createBaseOperationParams } from './testUtils'

import { getProjectIds } from '../../utils/idCollectorUtils'

const nameGenerator = new NameGenerator(EN.defaultNames)

const fixture = () =>
  d.subProject({
    id: 'sub',
    constraints: {
      linked: {
        id: 'linked',
        type: 'equal-constraint',
        fields: [
          { id: 'panel-field', type: 'panel-constraint-field', modelId: 'panel', field: 'width' },
          { id: 'child-field', type: 'panel-constraint-field', modelId: 'child', field: 'height' },
        ],
      },
    },
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
  it('copies the full component tree with owned holes and stitches', () => {
    const source = fixture()
    const snapshot = structuredClone(source)
    const project = d.project({ id: 'project', subProjects: [source] })
    const sourceIds = getProjectIds(project)
    const result = cloneComponent(createBaseOperationParams(source, { name: nameGenerator }), { id: 'panel' })
    expect(result.constraints).toBe(source.constraints)
    const copyId = result.components.root.children[1]
    const copy = result.components[copyId]
    const componentCount = 2
    expect(result.components.root.children).toEqual(['panel', copyId, 'outside'])
    expect(copy.id).toMatch(/^panel-/)
    expect(copy.children).toHaveLength(1)
    expect(Object.keys(result.components)).toHaveLength(Object.keys(source.components).length + componentCount)
    expect(result.holes).toHaveLength(source.holes.length + componentCount)
    expect(result.stitchLines).toHaveLength(source.stitchLines.length + componentCount * 2)
    const copies = [copyId, ...copy.children]
    const copiedHoles = result.holes.slice(source.holes.length)
    expect(copiedHoles.map((hole) => hole.componentId)).toEqual(copies)
    const targets = new Set([...copies, ...copiedHoles.map((hole) => hole.id)])
    for (const stitchLine of result.stitchLines.slice(source.stitchLines.length)) {
      expect(stitchLine.id).toMatch(/^component-bounds-stitch-line-/)
      expect(targets.has(stitchLine.targetId)).toBe(true)
    }
    for (const id of getProjectIds({ subProjects: [result] })) {
      if (!getProjectIds({ subProjects: [source] }).has(id)) {
        expect(sourceIds.has(id)).toBe(false)
      }
    }
    expect(source).toEqual(snapshot)
  })

  it('reserves names for every copied entity', () => {
    const source = fixture()
    const result = cloneComponent(createBaseOperationParams(source, { name: nameGenerator }), { id: 'panel' })
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
    expect(cloneComponent(createBaseOperationParams(source, { name: nameGenerator }), { id: componentId })).toBe(source)
  })

  it.each(['missing', 'panel'])('does not clone an invalid tree referencing %s', (childId) => {
    const source = fixture()
    source.components.child.children = [childId]
    expect(cloneComponent(createBaseOperationParams(source, { name: nameGenerator }), { id: 'panel' })).toBe(source)
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
      pocketOpenings: [
        { id: 'opening', type: 'slanted', name: 'Shared', offset: 4, side: 'start' },
        { id: 'other-opening', type: 'slanted', name: 'Other', offset: 4, side: 'start' },
      ],
      constraints: {
        linked: {
          id: 'linked',
          type: 'equal-constraint',
          fields: [
            { id: 'opening-field', type: 'slanted-constraint-field', modelId: 'opening', field: 'offset' },
            { id: 'other-opening-field', type: 'slanted-constraint-field', modelId: 'other-opening', field: 'offset' },
          ],
        },
      },
      stitchLines: [
        d.tPocketStitchLine({ id: 'shared', targetId: 'cluster', targetType: 'component' }),
        d.tPocketStitchLine({ id: 'local', targetId: 't', targetType: 'component' }),
      ],
    })
    const result = cloneComponent(createBaseOperationParams(source, { name: nameGenerator }), { id: 'cluster' })
    const accessor = accessors.subProject(result)
    const cluster = accessor.component.pocketCluster(result.components.root.children[1])
    expect(accessor.component.tPocket(cluster.children[0]).openingId).toBe('opening')
    expect(accessor.component.frontPocket(cluster.children[1]).openingId).toBe('opening')
    expect(result.pocketOpenings).toBe(source.pocketOpenings)
    expect(result.constraints).toBe(source.constraints)
    expect(result.stitchLines.slice(-2).map((stitchLine) => stitchLine.targetId)).toEqual([
      cluster.id,
      cluster.children[0],
    ])

    const pocketCopy = cloneComponent(createBaseOperationParams(source, { name: nameGenerator }), { id: 't' })
    const copyId = pocketCopy.components.cluster.children[1]
    expect(pocketCopy.stitchLines).toHaveLength(3)
    expect(pocketCopy.stitchLines[0]).toBe(source.stitchLines[0])
    expect(pocketCopy.stitchLines[2].targetId).toBe(copyId)
    const computed = accessors.computedSubProject(getComputedSubProject(pocketCopy, defaultStitchingSettings))
    expect(computed.stitchLine.byId('shared').routes.map((route) => route.targetId)).toEqual(['t', copyId])
  })
})

const pocketFixture = () => {
  const first = d.pocketCluster({ id: 'first', children: ['a', 'front-a'] })
  const second = d.pocketCluster({ id: 'second', children: ['b', 'front-b'] })
  return d.subProject({
    id: 'sub',
    root: d.rootPanel({ id: 'root', children: ['first', 'second'] }),
    components: [
      first,
      second,
      d.tPocket({ id: 'a' }),
      d.tPocket({ id: 'b' }),
      d.frontPocket({ id: 'front-a', children: ['child'] }),
      d.frontPocket({ id: 'front-b' }),
      d.panel({ id: 'child' }),
    ],
  })
}

describe('cloneComponent pocket trees', () => {
  it('copies pockets and their nested children', () => {
    const source = pocketFixture()
    const result = cloneComponent(createBaseOperationParams(source, { name: nameGenerator }), { id: 'first' })
    const rootId = result.components.root.children[1]
    const copy = result.components[rootId]
    expect(copy.type).toBe('pocket-cluster')
    expect(copy.children).toHaveLength(2)
    const front = result.components[copy.children[1]]
    expect(front.type).toBe('front-pocket')
    expect(front.children).toHaveLength(1)
  })

  it('inserts a cloned pocket cluster and its full tree after the source', () => {
    const source = pocketFixture()
    const before = structuredClone(source)

    const result = cloneComponent(createBaseOperationParams(source, { name: nameGenerator }), { id: 'first' })
    const copyId = result.components.root.children[1]
    expect(result.components.root.children).toEqual(['first', copyId, 'second'])
    expect(result.components[copyId].type).toBe('pocket-cluster')
    expect(result.components[copyId].children).toHaveLength(2)
    expect(Object.keys(result.components)).toHaveLength(Object.keys(source.components).length + 4)
    expect(result.components.first).toBe(source.components.first)
    expect(source).toEqual(before)
  })

  it('clones every optical illusion setting', () => {
    const original = pocketFixture()
    const a = narrowers.assert.tPocket(original.components.a)
    const opening = {
      type: 'optical-illusion' as const,
      ...defaultOpticalIllusionPocketOpening,
      id: 'optical',
      name: 'Optical',
      startInset: 12,
      endInset: 23,
      leadingRadius: 7,
      trailingRadius: 3,
    }
    const source = {
      ...original,
      pocketOpenings: { ...original.pocketOpenings, [opening.id]: opening },
      components: { ...original.components, a: { ...a, openingId: opening.id } },
    }
    const cloned = cloneComponent(createBaseOperationParams(source, { name: nameGenerator }), { id: 'first' })
    const copiedCluster = cloned.components[cloned.components.root.children[1]]
    const copiedPocket = narrowers.assert.tPocket(cloned.components[copiedCluster.children[0]])
    expect(copiedPocket.openingId).toBe(opening.id)
    expect(cloned.pocketOpenings).toBe(source.pocketOpenings)
  })

  it('keeps a lone front pocket uncloneable', () => {
    const source = pocketFixture()
    source.components.first.children = ['front-a']
    delete source.components.a
    const snapshot = structuredClone(source)
    expect(cloneComponent(createBaseOperationParams(source, { name: nameGenerator }), { id: 'front-a' })).toBe(source)
    expect(source).toEqual(snapshot)
  })
})
