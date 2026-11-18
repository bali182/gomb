import { describe, expect, it } from 'vitest'
import { defaultSlantedPocketOpening, defaultStitchingSettings } from '../../defaultStates'
import { getComputedSubProject } from '../../logic/getComputedSubProject'
import { d } from '../../testData'
import { EN } from '../../translations/en'
import { accessors } from '../../utils/accessors'
import { NameGenerator } from '../../utils/factory/NameGenerator'
import { narrowers } from '../../utils/narrowers'
import { cloneSubProject } from './cloneSubProject'

import { getProjectIds } from '../../utils/idCollectorUtils'

const nameGenerator = new NameGenerator(EN.defaultNames)

describe('cloneSubProject', () => {
  it('builds a complete cloned subproject from the component tree result', () => {
    const root = d.rootPanel({ id: 'root', name: 'Wallet' })
    const panel = d.panel({ id: 'panel', name: 'Panel' })
    const hole = d.hole({ id: 'hole', componentId: panel.id, name: 'Hole' })
    const stitchLine = d.componentBoundsStitchLine({
      id: 'stitch-line',
      name: 'Stitch line',
      targetId: hole.id,
      targetType: 'hole',
    })
    const sourceSubProject = d.subProject({
      frontFace: d.rootPanelFace({ id: 'root-front', children: ['panel'] }),
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
      subProject: sourceSubProject,
      nameGenerator,
    })
    const clonedSubProject = result.subProjects[result.subProjects.length - 1]

    const copiedRoot = clonedSubProject.components[clonedSubProject.root]
    const copiedPanelId = accessors
      .subProject(clonedSubProject)
      .component.childIds(accessors.subProject(clonedSubProject).component.rootPanel().frontFaceId)[0]
    const copiedHole = clonedSubProject.holes[0]
    expect(clonedSubProject.id).toMatch(/^sub-project-/)
    expect(copiedRoot).toMatchObject({ id: expect.stringMatching(/^root-panel-/), name: 'Wallet 2' })
    expect(narrowers.assert.panel(clonedSubProject.components[copiedPanelId]).name).toBe('Panel')
    expect(copiedHole).toMatchObject({ componentId: copiedPanelId, id: expect.stringMatching(/^hole-/), name: 'Hole' })
    expect(clonedSubProject.stitchLines).toMatchObject([
      {
        id: expect.stringMatching(/^component-bounds-stitch-line-/),
        targetId: copiedHole.id,
        targetType: 'hole',
        name: 'Stitch line',
      },
    ])
    const originalIds = getProjectIds(project)
    for (const id of getProjectIds({ subProjects: [clonedSubProject] })) {
      expect(originalIds.has(id)).toBe(false)
    }
  })
  it('remaps cluster and pocket stitch owners while retaining one computed object per source', () => {
    const source = d.subProject({
      frontFace: d.rootPanelFace({ id: 'root-front', children: ['cluster'] }),
      id: 'sub',
      root: d.rootPanel({ id: 'root' }),
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
      nameGenerator,
    })
    const cloned = result.subProjects[1]
    const accessor = accessors.subProject(cloned)
    const clusterId = accessor.component.rootPanelFace(accessor.component.rootPanel().frontFaceId).children[0]
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
    frontFace: d.rootPanelFace({ id: 'root-front', children: ['panel'] }),
    id: 'sub',
    root: d.rootPanel({ id: 'root' }),
    components: [d.panel({ id: 'panel' })],
    stitchLines: [
      d.componentBoundsStitchLine({ id: 'stitch', targetId: 'panel', targetType: 'component', onTop: 'root-front' }),
    ],
  })
  const project = d.project({ id: 'project', subProjects: [source] })
  const cloned = cloneSubProject(project, { subProject: source, nameGenerator }).subProjects[1]
  expect(cloned.stitchLines[0]).toMatchObject({
    targetId: accessors
      .subProject(cloned)
      .component.childIds(accessors.subProject(cloned).component.rootPanel().frontFaceId)[0],
    onTop: accessors.subProject(cloned).component.rootPanel().frontFaceId,
  })
})

it.each(['missing-root', 'missing-child', 'cycle'])('does not clone an invalid subproject: %s', (invalidity) => {
  const source = d.subProject({
    frontFace: d.rootPanelFace({ id: 'root-front', children: ['panel'] }),
    id: 'sub',
    root: d.rootPanel({ id: 'root' }),
    components: [d.panel({ id: 'panel' })],
  })
  if (invalidity === 'missing-root') {
    source.root = 'missing'
  } else {
    accessors
      .subProject(source)
      .component.childIds('panel')
      .splice(
        0,
        accessors.subProject(source).component.childIds('panel').length,
        ...[invalidity === 'cycle' ? 'root' : 'missing'],
      )
  }
  const project = d.project({ id: 'project', subProjects: [source] })
  expect(cloneSubProject(project, { subProject: source, nameGenerator })).toBe(project)
})

it('clones the complete binding structure with fresh IDs and remapped models', () => {
  const source = d.subProject({
    frontFace: d.rootPanelFace({ id: 'root-front', children: ['panel', 'cluster'] }),
    id: 'sub',
    root: d.rootPanel({ id: 'root' }),
    components: [
      d.panel({ id: 'panel' }),
      d.pocketCluster({ id: 'cluster', children: ['t', 'front'] }),
      d.tPocket({ id: 't', openingId: 'shared-opening' }),
      d.frontPocket({ id: 'front', openingId: 'shared-opening' }),
    ],
    holes: [d.hole({ id: 'hole', componentId: 'panel' })],
    stitchLines: [
      d.componentBoundsStitchLine({ id: 'stitch', targetId: 'hole', targetType: 'hole', onTop: 'root-front' }),
    ],
    pocketOpenings: [
      { id: 'shared-opening', type: 'slanted', name: 'Shared', slantOffset: 4, slantSide: 'start' },
      { id: 'unused-opening', type: 'slanted', name: 'Unused', slantOffset: 4, slantSide: 'start' },
    ],
    bindings: {
      dimensions: {
        id: 'dimensions',
        type: 'equal-binding',
        fields: [
          { id: 'root-field', type: 'root-panel-binding-field', modelId: 'root', field: 'width' },
          { id: 'panel-field', type: 'panel-binding-field', modelId: 'panel', field: 'height' },
          { id: 'hole-field', type: 'hole-binding-field', modelId: 'hole', field: 'width' },
          {
            id: 'stitch-field',
            type: 'component-bounds-stitch-line-binding-field',
            modelId: 'stitch',
            field: 'topLeftRadius',
          },
        ],
      },
      openings: {
        id: 'openings',
        type: 'equal-binding',
        fields: [
          { id: 'shared-field', type: 'slanted-binding-field', modelId: 'shared-opening', field: 'slantOffset' },
          { id: 'unused-field', type: 'slanted-binding-field', modelId: 'unused-opening', field: 'slantOffset' },
        ],
      },
    },
  })
  const project = d.project({ id: 'project', subProjects: [source] })
  const snapshot = structuredClone(project)
  const cloned = cloneSubProject(project, { subProject: source, nameGenerator }).subProjects[1]
  const copiedBindings = Object.values(cloned.bindings)
  expect(copiedBindings).toHaveLength(2)
  const dimensions = copiedBindings[0]
  const openings = copiedBindings[1]
  const copiedOpening = Object.values(cloned.pocketOpenings).find((opening) => opening.name === 'Shared')
  const unusedOpening = Object.values(cloned.pocketOpenings).find((opening) => opening.name === 'Unused')
  expect(dimensions.fields.map((field) => field.modelId)).toEqual([
    cloned.root,
    accessors.subProject(cloned).component.childIds(accessors.subProject(cloned).component.rootPanel().frontFaceId)[0],
    cloned.holes[0].id,
    cloned.stitchLines[0].id,
  ])
  expect(openings.fields.map((field) => field.modelId)).toEqual([copiedOpening?.id, unusedOpening?.id])
  const accessor = accessors.subProject(cloned)
  const cluster = accessor.component.pocketCluster(
    accessors.subProject(cloned).component.childIds(accessor.component.rootPanel().frontFaceId)[1],
  )
  expect(accessor.component.tPocket(cluster.children[0]).openingId).toBe(copiedOpening?.id)
  expect(accessor.component.frontPocket(cluster.children[1]).openingId).toBe(copiedOpening?.id)
  const originalBindings = Object.values(source.bindings)
  for (const [index, binding] of copiedBindings.entries()) {
    expect(cloned.bindings[binding.id]).toBe(binding)
    expect(binding.id).toMatch(/^equal-binding-/)
    expect(binding).not.toBe(originalBindings[index])
    expect(binding.fields).not.toBe(originalBindings[index].fields)
    expect(binding.fields.map(({ type, field }) => ({ type, field }))).toEqual(
      originalBindings[index].fields.map(({ type, field }) => ({ type, field })),
    )
    for (const [fieldIndex, field] of binding.fields.entries()) {
      expect(field.id.startsWith(`${field.type}-`)).toBe(true)
      expect(field).not.toBe(originalBindings[index].fields[fieldIndex])
    }
  }
  const originalIds = getProjectIds(project)
  for (const id of getProjectIds({ subProjects: [cloned] })) {
    expect(originalIds.has(id)).toBe(false)
  }
  expect(project).toEqual(snapshot)
})

const openingFixture = () => {
  const opening = {
    type: 'slanted' as const,
    ...defaultSlantedPocketOpening,
    id: 'shared',
    name: 'Slanted',
    offset: 1000,
  }
  const defaultOpening = { id: 'custom-default', name: 'Default', type: 'straight' } as const
  const root = d.rootPanel({ id: 'root', width: 100, height: 100 })
  const cluster = d.pocketCluster({ id: 'cluster', children: ['t', 'front'] })
  const t = d.tPocket({ id: 't', openingId: opening.id })
  const front = d.frontPocket({ id: 'front', openingId: opening.id })
  const original = d.subProject({
    frontFace: d.rootPanelFace({ id: 'root-front', children: ['cluster'] }),
    id: 'sub',
    root,
    components: [cluster, t, front],
    pocketOpenings: [opening, defaultOpening],
  })
  const subProject = {
    ...original,
    defaultPocketOpening: defaultOpening.id,
  }
  return {
    subProject,
    opening,
    defaultOpening,
    t,
    front,
    root,
    cluster,
    originalDefaultOpeningId: original.defaultPocketOpening,
  }
}

it('retains unused definitions and the default reference when duplicating a subproject', () => {
  const { subProject } = openingFixture()
  const unused = { type: 'slanted' as const, ...defaultSlantedPocketOpening, id: 'unused', name: 'Unused' }
  const source = { ...subProject, pocketOpenings: { ...subProject.pocketOpenings, unused } }
  const result = cloneSubProject(d.project({ id: 'project', subProjects: [source] }), {
    subProject: source,
    nameGenerator,
  })
  const cloned = result.subProjects[1]
  expect(cloned.defaultPocketOpening).not.toBe(source.defaultPocketOpening)
  expect(cloned.pocketOpenings[cloned.defaultPocketOpening]).toMatchObject({ name: 'Default' })
  expect(Object.values(cloned.pocketOpenings).map(({ id: _id, ...opening }) => opening)).toEqual(
    Object.values(source.pocketOpenings).map(({ id: _id, ...opening }) => opening),
  )
  for (const opening of Object.values(cloned.pocketOpenings)) {
    const id = opening.id
    expect(id.startsWith(`${opening.type}-pocket-opening-`)).toBe(true)
    expect(Object.keys(source.pocketOpenings)).not.toContain(id)
  }
  expect(cloned.pocketOpenings).not.toBe(source.pocketOpenings)
  const copiedShared = Object.values(cloned.pocketOpenings).find((opening) => opening.name === 'Slanted')
  expect(Object.values(cloned.pocketOpenings).find((opening) => opening.name === 'Unused')).toEqual({
    ...unused,
    id: expect.stringMatching(/^slanted-pocket-opening-/),
  })
  for (const pocket of Object.values(cloned.components)) {
    if (pocket.type === 't-pocket' || pocket.type === 'front-pocket') {
      expect(pocket.openingId).toBe(copiedShared?.id)
    }
  }
})
