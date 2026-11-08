import { describe, expect, it, vi } from 'vitest'
import {
  defaultComponentBoundsStitchLine,
  defaultStitchingSettings,
  defaultTPocketStitchLine,
} from '../../defaultStates'
import type { PocketOrientationSchema } from '../../schemas/components'
import { d } from '../../testData'
import { EN } from '../../translations/en'
import { accessors } from '../../utils/accessors'
import { NameGenerator } from '../../utils/factory/NameGenerator'
import { ReadonlyModelObjectFactory } from '../../utils/factory/ReadonlyModelObjectFactory'
import { getSubProjectIds } from '../../utils/idCollectorUtils'
import { IdGenerator } from '../../utils/random/IdGenerator'
import { addSubProject } from '../project/addSubProject'
import { addComponent } from './addComponent'
import { addConstraint } from './addConstraint'
import { addHole } from './addHole'
import { addPocketOpening } from './addPocketOpening'
import { addStitchLine } from './addStitchLine'
import { createBaseOperationParams } from './testUtils'

const createFactory = () => new ReadonlyModelObjectFactory(new IdGenerator(), new NameGenerator(EN.defaultNames))
const fixture = () =>
  d.subProject({
    id: 'sub',
    root: d.rootPanel({ id: 'root', children: ['panel', 'cluster'], name: 'Panel 1' }),
    components: [d.panel({ id: 'panel', name: 'Panel 2' }), d.pocketCluster({ id: 'cluster' })],
    holes: [d.hole({ id: 'hole', componentId: 'panel', name: 'Hole 1' })],
    stitchLines: [
      d.componentBoundsStitchLine({ id: 'stitch', targetId: 'hole', targetType: 'hole', name: 'Stitching 1' }),
    ],
    pocketOpenings: [{ type: 'straight', id: 'opening', name: 'Straight 2' }],
  })

describe('model creation in add operations', () => {
  it.each([false, true])('uses the default leather color only when enabled: %s', (addBaseColor) => {
    const source = fixture()
    const base = createBaseOperationParams(source)
    base.settings.edit.addBaseColor = addBaseColor
    base.project.colorSettings.leatherColor = 'blue'
    const result = addComponent(base, { parentId: 'root', type: 'panel', position: 'end' })
    const added = result.components[result.components.root.children[result.components.root.children.length - 1]]
    expect(added.color).toBe(addBaseColor ? 'blue' : undefined)
  })

  it('gives an explicit color precedence over the default leather color', () => {
    const source = fixture()
    const base = createBaseOperationParams(source)
    base.settings.edit.addBaseColor = true
    base.project.colorSettings.leatherColor = 'blue'
    const result = addComponent(base, { parentId: 'root', type: 'panel', position: 'end', color: 'red' })
    expect(result.components[result.components.root.children[result.components.root.children.length - 1]].color).toBe(
      'red',
    )
  })

  it('generates component names from the current snapshot when reusing a readonly factory', () => {
    const source = fixture()
    const snapshot = structuredClone(source)
    const modelFactory = createFactory()
    const params = { type: 'panel' as const, parentId: 'root', position: 'end' as const }
    const first = addComponent(createBaseOperationParams(source, { readonlyFactory: modelFactory }), params)
    const second = addComponent(createBaseOperationParams(first, { readonlyFactory: modelFactory }), params)
    const firstId = first.components.root.children[first.components.root.children.length - 1]
    const secondId = second.components.root.children[second.components.root.children.length - 1]
    expect(first.components[firstId]).toMatchObject({ type: 'panel', name: 'Panel 3' })
    expect(second.components[secondId]).toMatchObject({ type: 'panel', name: 'Panel 4' })
    expect(firstId).not.toBe(secondId)
    expect(source).toEqual(snapshot)
    expect(first.components.root.children).not.toContain(secondId)
  })

  it('supplies the default opening, project stitching settings and requested color to the factory', () => {
    const source = fixture()
    const modelFactory = createFactory()
    const createComponent = vi.spyOn(modelFactory, 'createComponent')
    const result = addComponent(createBaseOperationParams(source, { readonlyFactory: modelFactory }), {
      parentId: 'cluster',
      type: 't-pocket',
      position: 'end',
      color: 'red',
    })
    const pocket = accessors.subProject(result).component.tPocket(result.components.cluster.children[0])
    expect(pocket).toMatchObject({ openingId: source.defaultPocketOpening, color: 'red', name: 'T-pocket 1' })
    expect(createComponent).toHaveBeenCalledWith(
      expect.objectContaining({
        forbiddenIds: getSubProjectIds(source),
        stitchingSettings: defaultStitchingSettings,
      }),
    )
  })

  it('does not create a component for an invalid insertion or missing parent', () => {
    const source = fixture()
    const modelFactory = createFactory()
    const createComponent = vi.spyOn(modelFactory, 'createComponent')
    const params = { parentId: 'root', type: 'panel' as const, position: -1 }
    expect(addComponent(createBaseOperationParams(source, { readonlyFactory: modelFactory }), params)).toBe(source)
    expect(() =>
      addComponent(createBaseOperationParams(source, { readonlyFactory: modelFactory }), {
        ...params,
        parentId: 'missing',
      }),
    ).toThrow('Missing parent')
    expect(createComponent).not.toHaveBeenCalled()
  })

  it('creates a hole with an unused hole name and keeps the source unchanged', () => {
    const source = fixture()
    const snapshot = structuredClone(source)
    const modelFactory = createFactory()
    const createHole = vi.spyOn(modelFactory, 'createHole')
    const result = addHole(createBaseOperationParams(source, { readonlyFactory: modelFactory }), { targetId: 'panel' })
    expect(result.holes[result.holes.length - 1]).toMatchObject({ componentId: 'panel', name: 'Hole 2' })
    expect(createHole).toHaveBeenCalledWith(expect.objectContaining({ forbiddenIds: getSubProjectIds(source) }))
    expect(source).toEqual(snapshot)
  })

  it('does not create a hole for a pocket cluster', () => {
    const source = fixture()
    const modelFactory = createFactory()
    const createHole = vi.spyOn(modelFactory, 'createHole')
    expect(addHole(createBaseOperationParams(source, { readonlyFactory: modelFactory }), { targetId: 'cluster' })).toBe(
      source,
    )
    expect(createHole).not.toHaveBeenCalled()
  })

  it('creates stitching for its target using all existing stitch names', () => {
    const source = fixture()
    const snapshot = structuredClone(source)
    const modelFactory = createFactory()
    const result = addStitchLine(createBaseOperationParams(source, { readonlyFactory: modelFactory }), {
      targetId: 'hole',
      targetType: 'hole',
    })
    expect(result.stitchLines[result.stitchLines.length - 1]).toMatchObject({
      ...defaultComponentBoundsStitchLine,
      type: 'component-bounds-stitch-line',
      targetId: 'hole',
      targetType: 'hole',
      name: 'Stitching 2',
    })
    expect(source).toEqual(snapshot)
  })

  describe.each<PocketOrientationSchema>(['up', 'right', 'down', 'left'])(
    'pocket stitching with opening facing %s',
    (orientation) => {
      it.each(['cluster', 'front'])('leaves the opening edge and its corners unstitched on %s', (targetId) => {
        const source = d.subProject({
          id: 'sub',
          root: d.rootPanel({ id: 'root', children: ['cluster'] }),
          components: [
            d.pocketCluster({ id: 'cluster', orientation, children: ['front'] }),
            d.frontPocket({ id: 'front', openingId: 'opening' }),
          ],
          stitchLines: [d.componentBoundsStitchLine({ id: 'existing', targetType: 'component', targetId })],
        })
        const snapshot = structuredClone(source)
        const result = addStitchLine(createBaseOperationParams(source, { readonlyFactory: createFactory() }), {
          type: 'component-bounds-stitch-line',
          targetId,
          targetType: 'component',
        })
        expect(result.stitchLines[result.stitchLines.length - 1]).toMatchObject({
          type: 'component-bounds-stitch-line',
          targetId,
          targetType: 'component',
          top: orientation !== 'up',
          right: orientation !== 'right',
          bottom: orientation !== 'down',
          left: orientation !== 'left',
          topLeftCorner: orientation !== 'up' && orientation !== 'left',
          topRightCorner: orientation !== 'up' && orientation !== 'right',
          bottomRightCorner: orientation !== 'down' && orientation !== 'right',
          bottomLeftCorner: orientation !== 'down' && orientation !== 'left',
        })
        expect(result.stitchLines[0]).toBe(source.stitchLines[0])
        expect(source).toEqual(snapshot)
      })
    },
  )

  it.each(['root', 'panel'])('keeps every side and corner enabled when creating stitching on %s', (targetId) => {
    const result = addStitchLine(createBaseOperationParams(fixture(), { readonlyFactory: createFactory() }), {
      type: 'component-bounds-stitch-line',
      targetType: 'component',
      targetId,
    })
    expect(result.stitchLines[result.stitchLines.length - 1]).toMatchObject(defaultComponentBoundsStitchLine)
  })

  it('keeps every side and corner enabled when creating stitching on a front pocket hole', () => {
    const source = d.subProject({
      id: 'sub',
      root: d.rootPanel({ id: 'root', children: ['cluster'] }),
      components: [
        d.pocketCluster({ id: 'cluster', orientation: 'right', children: ['front'] }),
        d.frontPocket({ id: 'front', openingId: 'opening' }),
      ],
      holes: [d.hole({ id: 'hole', componentId: 'front' })],
    })
    const result = addStitchLine(createBaseOperationParams(source, { readonlyFactory: createFactory() }), {
      targetType: 'hole',
      targetId: 'hole',
    })
    expect(result.stitchLines[result.stitchLines.length - 1]).toMatchObject(defaultComponentBoundsStitchLine)
  })

  it.each(['cluster', 't-pocket'])('keeps T-pocket stitching defaults when creating stitching on %s', (targetId) => {
    const source = d.subProject({
      id: 'sub',
      root: d.rootPanel({ id: 'root', children: ['cluster'] }),
      components: [
        d.pocketCluster({ id: 'cluster', orientation: 'right', children: ['t-pocket', 'front'] }),
        d.tPocket({ id: 't-pocket', openingId: 'opening' }),
        d.frontPocket({ id: 'front', openingId: 'opening' }),
      ],
    })
    const result = addStitchLine(createBaseOperationParams(source, { readonlyFactory: createFactory() }), {
      type: 't-pocket-stitch-line',
      targetType: 'component',
      targetId,
    })
    expect(result.stitchLines[result.stitchLines.length - 1]).toEqual({
      ...defaultTPocketStitchLine,
      type: 't-pocket-stitch-line',
      targetType: 'component',
      targetId,
      id: expect.any(String),
      name: expect.any(String),
    })
  })

  it('adds an opening using the current names without changing the default reference', () => {
    const source = fixture()
    const snapshot = structuredClone(source)
    const result = addPocketOpening(createBaseOperationParams(source, { readonlyFactory: createFactory() }), {
      type: 'straight',
    })
    const added = Object.values(result.pocketOpenings).find(
      (opening) => !Object.prototype.hasOwnProperty.call(source.pocketOpenings, opening.id),
    )
    expect(added).toMatchObject({ type: 'straight', name: 'Straight 3' })
    expect(result.defaultPocketOpening).toBe(source.defaultPocketOpening)
    expect(source).toEqual(snapshot)
  })

  it('creates an empty constraint without changing the source', () => {
    const source = fixture()
    const snapshot = structuredClone(source)
    const result = addConstraint(createBaseOperationParams(source, { readonlyFactory: createFactory() }), {
      type: 'equal-constraint',
    })
    const constraint = Object.values(result.constraints)[0]
    expect(constraint).toMatchObject({ type: 'equal-constraint', fields: [] })
    expect(constraint.id).toMatch(/^equal-constraint-/)
    expect(source).toEqual(snapshot)
    expect(source.constraints).toEqual({})
  })

  it('adds and returns the new subproject while preserving the project snapshot', () => {
    const project = d.project({ id: 'project', subProjects: [fixture()] })
    const snapshot = structuredClone(project)
    const result = addSubProject(project, { modelFactory: createFactory() })
    expect(result.project.subProjects).toEqual([...project.subProjects, result.subProject])
    expect(result.subProject.components[result.subProject.root].name).toBe('Module 1')
    expect(project).toEqual(snapshot)
  })
})
