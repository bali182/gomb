import { describe, expect, it, vi } from 'vitest'
import { defaultStitchingSettings } from '../../defaultStates'
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
  it('generates component names from the current snapshot when reusing a readonly factory', () => {
    const source = fixture()
    const snapshot = structuredClone(source)
    const modelFactory = createFactory()
    const params = {
      type: 'panel' as const,
      parentId: 'root',
      position: 'end' as const,
      stitchingSettings: defaultStitchingSettings,
      modelFactory,
    }
    const first = addComponent(source, params)
    const second = addComponent(first, params)
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
    const result = addComponent(source, {
      parentId: 'cluster',
      type: 't-pocket',
      position: 'end',
      modelFactory,
      color: 'red',
      stitchingSettings: defaultStitchingSettings,
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
    const params = {
      parentId: 'root',
      type: 'panel' as const,
      position: -1,
      modelFactory,
      stitchingSettings: defaultStitchingSettings,
    }
    expect(addComponent(source, params)).toBe(source)
    expect(() => addComponent(source, { ...params, parentId: 'missing' })).toThrow('Missing parent')
    expect(createComponent).not.toHaveBeenCalled()
  })

  it('creates a hole with an unused hole name and keeps the source unchanged', () => {
    const source = fixture()
    const snapshot = structuredClone(source)
    const modelFactory = createFactory()
    const createHole = vi.spyOn(modelFactory, 'createHole')
    const result = addHole(source, { componentId: 'panel', modelFactory })
    expect(result.holes[result.holes.length - 1]).toMatchObject({ componentId: 'panel', name: 'Hole 2' })
    expect(createHole).toHaveBeenCalledWith(expect.objectContaining({ forbiddenIds: getSubProjectIds(source) }))
    expect(source).toEqual(snapshot)
  })

  it('does not create a hole for a pocket cluster', () => {
    const source = fixture()
    const modelFactory = createFactory()
    const createHole = vi.spyOn(modelFactory, 'createHole')
    expect(addHole(source, { componentId: 'cluster', modelFactory })).toBe(source)
    expect(createHole).not.toHaveBeenCalled()
  })

  it('creates stitching for its target using all existing stitch names', () => {
    const source = fixture()
    const snapshot = structuredClone(source)
    const modelFactory = createFactory()
    const result = addStitchLine(source, {
      type: 'component-bounds-stitch-line',
      targetId: 'hole',
      targetType: 'hole',
      modelFactory,
    })
    expect(result.stitchLines[result.stitchLines.length - 1]).toMatchObject({
      type: 'component-bounds-stitch-line',
      targetId: 'hole',
      targetType: 'hole',
      name: 'Stitching 2',
    })
    expect(source).toEqual(snapshot)
  })

  it('adds an opening using the current names without changing the default reference', () => {
    const source = fixture()
    const snapshot = structuredClone(source)
    const result = addPocketOpening(source, { type: 'straight', modelFactory: createFactory() })
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
    const result = addConstraint(source, { type: 'equal-constraint', modelFactory: createFactory() })
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
