import { describe, expect, it } from 'vitest'
import { EN } from '../../translations/en'
import { NameGenerator } from '../../utils/factory/NameGenerator'
import { getProjectIds } from '../../utils/idCollectorUtils'

import { defaultStitchingSettings } from '../../defaultStates'
import { getComputedSubProject } from '../../logic/getComputedSubProject'
import { d } from '../../testData'
import { accessors } from '../../utils/accessors'
import { cloneSubProject } from './cloneSubProject'

const nameGenerator = new NameGenerator(EN.defaultNames)

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
      subProject: sourceSubProject,
      nameGenerator,
    })
    const clonedSubProject = result.subProjects[result.subProjects.length - 1]

    const copiedRoot = clonedSubProject.components[clonedSubProject.root]
    const copiedPanelId = copiedRoot.children[0]
    const copiedHole = clonedSubProject.holes[0]
    expect(clonedSubProject.id).toMatch(/^sub-project-/)
    expect(copiedRoot).toMatchObject({ id: expect.stringMatching(/^root-panel-/), name: 'Wallet 2' })
    expect(clonedSubProject.components[copiedPanelId].name).toBe('Panel')
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
      nameGenerator,
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
  const cloned = cloneSubProject(project, { subProject: source, nameGenerator }).subProjects[1]
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
  expect(cloneSubProject(project, { subProject: source, nameGenerator })).toBe(project)
})

it('clones the complete constraint structure with fresh IDs and remapped models', () => {
  const source = d.subProject({
    id: 'sub',
    root: d.rootPanel({ id: 'root', children: ['panel', 'cluster'] }),
    components: [
      d.panel({ id: 'panel' }),
      d.pocketCluster({ id: 'cluster', children: ['t', 'front'] }),
      d.tPocket({ id: 't', openingId: 'shared-opening' }),
      d.frontPocket({ id: 'front', openingId: 'shared-opening' }),
    ],
    holes: [d.hole({ id: 'hole', componentId: 'panel' })],
    stitchLines: [d.componentBoundsStitchLine({ id: 'stitch', targetId: 'hole', targetType: 'hole', onTop: 'root' })],
    pocketOpenings: [
      { id: 'shared-opening', type: 'slanted', name: 'Shared', offset: 4, side: 'start' },
      { id: 'unused-opening', type: 'slanted', name: 'Unused', offset: 4, side: 'start' },
    ],
    constraints: {
      dimensions: {
        id: 'dimensions',
        type: 'equal-constraint',
        fields: [
          { id: 'root-field', type: 'root-panel-constraint-field', modelId: 'root', field: 'width' },
          { id: 'panel-field', type: 'panel-constraint-field', modelId: 'panel', field: 'height' },
          { id: 'hole-field', type: 'hole-constraint-field', modelId: 'hole', field: 'width' },
          {
            id: 'stitch-field',
            type: 'component-bounds-stitch-line-constraint-field',
            modelId: 'stitch',
            field: 'topLeftRadius',
          },
        ],
      },
      openings: {
        id: 'openings',
        type: 'equal-constraint',
        fields: [
          { id: 'shared-field', type: 'slanted-constraint-field', modelId: 'shared-opening', field: 'offset' },
          { id: 'unused-field', type: 'slanted-constraint-field', modelId: 'unused-opening', field: 'offset' },
        ],
      },
    },
  })
  const project = d.project({ id: 'project', subProjects: [source] })
  const snapshot = structuredClone(project)
  const cloned = cloneSubProject(project, { subProject: source, nameGenerator }).subProjects[1]
  const copiedConstraints = Object.values(cloned.constraints)
  expect(copiedConstraints).toHaveLength(2)
  const dimensions = copiedConstraints[0]
  const openings = copiedConstraints[1]
  const copiedOpening = Object.values(cloned.pocketOpenings).find((opening) => opening.name === 'Shared')
  const unusedOpening = Object.values(cloned.pocketOpenings).find((opening) => opening.name === 'Unused')
  expect(dimensions.fields.map((field) => field.modelId)).toEqual([
    cloned.root,
    cloned.components[cloned.root].children[0],
    cloned.holes[0].id,
    cloned.stitchLines[0].id,
  ])
  expect(openings.fields.map((field) => field.modelId)).toEqual([copiedOpening?.id, unusedOpening?.id])
  const accessor = accessors.subProject(cloned)
  const cluster = accessor.component.pocketCluster(cloned.components[cloned.root].children[1])
  expect(accessor.component.tPocket(cluster.children[0]).openingId).toBe(copiedOpening?.id)
  expect(accessor.component.frontPocket(cluster.children[1]).openingId).toBe(copiedOpening?.id)
  const originalConstraints = Object.values(source.constraints)
  for (const [index, constraint] of copiedConstraints.entries()) {
    expect(cloned.constraints[constraint.id]).toBe(constraint)
    expect(constraint.id).toMatch(/^equal-constraint-/)
    expect(constraint).not.toBe(originalConstraints[index])
    expect(constraint.fields).not.toBe(originalConstraints[index].fields)
    expect(constraint.fields.map(({ type, field }) => ({ type, field }))).toEqual(
      originalConstraints[index].fields.map(({ type, field }) => ({ type, field })),
    )
    for (const [fieldIndex, field] of constraint.fields.entries()) {
      expect(field.id.startsWith(`${field.type}-`)).toBe(true)
      expect(field).not.toBe(originalConstraints[index].fields[fieldIndex])
    }
  }
  const originalIds = getProjectIds(project)
  for (const id of getProjectIds({ subProjects: [cloned] })) {
    expect(originalIds.has(id)).toBe(false)
  }
  expect(project).toEqual(snapshot)
})
