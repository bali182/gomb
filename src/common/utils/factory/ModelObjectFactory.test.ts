import { describe, expect, expectTypeOf, it, vi } from 'vitest'
import { defaultPanel, defaultStitchingSettings } from '../../defaultStates'
import type { PanelSchema } from '../../schemas/components'
import type { ConstraintFieldSchema } from '../../schemas/constraints'
import type {
  CreateEqualConstraintParamsSchema,
  CreatePanelConstraintFieldParamsSchema,
  CreatePanelParamsSchema,
  HasForbiddenIdsSchema,
  HasForbiddenNamesSchema,
  ModelObjectFactorySchema,
  ReadonlyCreateConstraintFieldParamsSchema,
  ReadonlyCreateEqualConstraintParamsSchema,
  ReadonlyCreatePanelConstraintFieldParamsSchema,
  ReadonlyCreatePanelParamsSchema,
  ReadonlyModelObjectFactorySchema,
} from '../../schemas/factory'
import type { IdPrefixSchema } from '../../schemas/idGenerator'
import type { ModelObjectSchema } from '../../schemas/modelObject'
import { IdGenerator } from '../random/IdGenerator'
import { ModelObjectFactory } from './ModelObjectFactory'
import { NameGenerator } from './NameGenerator'
import { ReadonlyModelObjectFactory } from './ReadonlyModelObjectFactory'

type FactoryCaseParamsSchema = HasForbiddenIdsSchema & HasForbiddenNamesSchema

type FactorySchema = ReadonlyModelObjectFactorySchema | ModelObjectFactorySchema
type FactoryResultSchema = ModelObjectSchema | ConstraintFieldSchema
type FactoryCaseSchema = {
  label: string
  prefix: IdPrefixSchema
  type: FactoryResultSchema['type']
  create: (factory: FactorySchema, params: FactoryCaseParamsSchema) => FactoryResultSchema
}

const translations: Record<IdPrefixSchema, string> = {
  'project': 'Name',
  'sub-project': 'Name',
  'root-panel': 'Name',
  'panel': 'Name',
  'pocket-cluster': 'Name',
  'front-pocket': 'Name',
  't-pocket': 'Name',
  't-pocket-stitch-line': 'Name',
  'component-bounds-stitch-line': 'Name',
  'hole': 'Name',
  'straight-pocket-opening': 'Name',
  'recessed-pocket-opening': 'Name',
  'slanted-pocket-opening': 'Name',
  'optical-illusion-pocket-opening': 'Name',
  'equal-constraint': 'Name',
  'root-panel-constraint-field': 'Name',
  'panel-constraint-field': 'Name',
  'pocket-cluster-constraint-field': 'Name',
  'front-pocket-constraint-field': 'Name',
  't-pocket-constraint-field': 'Name',
  'hole-constraint-field': 'Name',
  'recessed-constraint-field': 'Name',
  'slanted-constraint-field': 'Name',
  'optical-illusion-constraint-field': 'Name',
  'component-bounds-stitch-line-constraint-field': 'Name',
  't-pocket-stitch-line-constraint-field': 'Name',
}

const createGenerators = () => {
  const id = new IdGenerator()
  const name = new NameGenerator(translations)
  vi.spyOn(id, 'get').mockImplementation((prefix, forbidden = new Set<string>()): string => {
    let index = 1
    while (forbidden.has(`${prefix}-${index}`)) {
      index += 1
    }
    return `${prefix}-${index}`
  })
  return { id, name }
}

const cases: FactoryCaseSchema[] = [
  {
    label: 'createRootPanel',
    prefix: 'root-panel',
    type: 'root-panel',
    create: (factory, params) => factory.createRootPanel({ ...params, stitchingSettings: defaultStitchingSettings }),
  },
  {
    label: 'createPanel',
    prefix: 'panel',
    type: 'panel',
    create: (factory, params) => factory.createPanel({ ...params }),
  },
  {
    label: 'createPocketCluster',
    prefix: 'pocket-cluster',
    type: 'pocket-cluster',
    create: (factory, params) =>
      factory.createPocketCluster({ ...params, stitchingSettings: defaultStitchingSettings }),
  },
  {
    label: 'createFrontPocket',
    prefix: 'front-pocket',
    type: 'front-pocket',
    create: (factory, params) => factory.createFrontPocket({ ...params, openingId: 'opening' }),
  },
  {
    label: 'createTPocket',
    prefix: 't-pocket',
    type: 't-pocket',
    create: (factory, params) => factory.createTPocket({ ...params, openingId: 'opening' }),
  },
  {
    label: 'createHole',
    prefix: 'hole',
    type: 'hole',
    create: (factory, params) => factory.createHole({ ...params, componentId: 'component' }),
  },
  {
    label: 'createComponentBoundsStitchLine',
    prefix: 'component-bounds-stitch-line',
    type: 'component-bounds-stitch-line',
    create: (factory, params) =>
      factory.createComponentBoundsStitchLine({ ...params, targetId: 'hole', targetType: 'hole' }),
  },
  {
    label: 'createTPocketStitchLine',
    prefix: 't-pocket-stitch-line',
    type: 't-pocket-stitch-line',
    create: (factory, params) =>
      factory.createTPocketStitchLine({ ...params, targetId: 'component', targetType: 'component' }),
  },
  {
    label: 'createStraightPocketOpening',
    prefix: 'straight-pocket-opening',
    type: 'straight',
    create: (factory, params) => factory.createStraightPocketOpening(params),
  },
  {
    label: 'createRecessedPocketOpening',
    prefix: 'recessed-pocket-opening',
    type: 'recessed',
    create: (factory, params) => factory.createRecessedPocketOpening(params),
  },
  {
    label: 'createSlantedPocketOpening',
    prefix: 'slanted-pocket-opening',
    type: 'slanted',
    create: (factory, params) => factory.createSlantedPocketOpening(params),
  },
  {
    label: 'createOpticalIllusionPocketOpening',
    prefix: 'optical-illusion-pocket-opening',
    type: 'optical-illusion',
    create: (factory, params) => factory.createOpticalIllusionPocketOpening(params),
  },
  {
    label: 'createEqualConstraint',
    prefix: 'equal-constraint',
    type: 'equal-constraint',
    create: (factory, params) => factory.createEqualConstraint({ forbiddenIds: params.forbiddenIds }),
  },
  {
    label: 'createRootPanelConstraintField',
    prefix: 'root-panel-constraint-field',
    type: 'root-panel-constraint-field',
    create: (factory, params) =>
      factory.createRootPanelConstraintField({
        forbiddenIds: params.forbiddenIds,
        type: 'root-panel-constraint-field',
        modelId: 'model',
        field: 'width',
      }),
  },
  {
    label: 'createPanelConstraintField',
    prefix: 'panel-constraint-field',
    type: 'panel-constraint-field',
    create: (factory, params) =>
      factory.createPanelConstraintField({
        forbiddenIds: params.forbiddenIds,
        type: 'panel-constraint-field',
        modelId: 'model',
        field: 'height',
      }),
  },
  {
    label: 'createPocketClusterConstraintField',
    prefix: 'pocket-cluster-constraint-field',
    type: 'pocket-cluster-constraint-field',
    create: (factory, params) =>
      factory.createPocketClusterConstraintField({
        forbiddenIds: params.forbiddenIds,
        type: 'pocket-cluster-constraint-field',
        modelId: 'model',
        field: 'pocketStep',
      }),
  },
  {
    label: 'createFrontPocketConstraintField',
    prefix: 'front-pocket-constraint-field',
    type: 'front-pocket-constraint-field',
    create: (factory, params) =>
      factory.createFrontPocketConstraintField({
        forbiddenIds: params.forbiddenIds,
        type: 'front-pocket-constraint-field',
        modelId: 'model',
        field: 'openingId',
      }),
  },
  {
    label: 'createTPocketConstraintField',
    prefix: 't-pocket-constraint-field',
    type: 't-pocket-constraint-field',
    create: (factory, params) =>
      factory.createTPocketConstraintField({
        forbiddenIds: params.forbiddenIds,
        type: 't-pocket-constraint-field',
        modelId: 'model',
        field: 'itemId',
      }),
  },
  {
    label: 'createHoleConstraintField',
    prefix: 'hole-constraint-field',
    type: 'hole-constraint-field',
    create: (factory, params) =>
      factory.createHoleConstraintField({
        forbiddenIds: params.forbiddenIds,
        type: 'hole-constraint-field',
        modelId: 'model',
        field: 'xOffset',
      }),
  },
  {
    label: 'createRecessedPocketOpeningConstraintField',
    prefix: 'recessed-constraint-field',
    type: 'recessed-constraint-field',
    create: (factory, params) =>
      factory.createRecessedPocketOpeningConstraintField({
        forbiddenIds: params.forbiddenIds,
        type: 'recessed-constraint-field',
        modelId: 'model',
        field: 'depth',
      }),
  },
  {
    label: 'createSlantedPocketOpeningConstraintField',
    prefix: 'slanted-constraint-field',
    type: 'slanted-constraint-field',
    create: (factory, params) =>
      factory.createSlantedPocketOpeningConstraintField({
        forbiddenIds: params.forbiddenIds,
        type: 'slanted-constraint-field',
        modelId: 'model',
        field: 'side',
      }),
  },
  {
    label: 'createOpticalIllusionPocketOpeningConstraintField',
    prefix: 'optical-illusion-constraint-field',
    type: 'optical-illusion-constraint-field',
    create: (factory, params) =>
      factory.createOpticalIllusionPocketOpeningConstraintField({
        forbiddenIds: params.forbiddenIds,
        type: 'optical-illusion-constraint-field',
        modelId: 'model',
        field: 'direction',
      }),
  },
  {
    label: 'createComponentBoundsStitchLineConstraintField',
    prefix: 'component-bounds-stitch-line-constraint-field',
    type: 'component-bounds-stitch-line-constraint-field',
    create: (factory, params) =>
      factory.createComponentBoundsStitchLineConstraintField({
        forbiddenIds: params.forbiddenIds,
        type: 'component-bounds-stitch-line-constraint-field',
        modelId: 'model',
        field: 'onTop',
      }),
  },
  {
    label: 'createTPocketStitchLineConstraintField',
    prefix: 't-pocket-stitch-line-constraint-field',
    type: 't-pocket-stitch-line-constraint-field',
    create: (factory, params) =>
      factory.createTPocketStitchLineConstraintField({
        forbiddenIds: params.forbiddenIds,
        type: 't-pocket-stitch-line-constraint-field',
        modelId: 'model',
        field: 'stitchMargin',
      }),
  },
]

describe.each(['readonly', 'forbidding'])('%s model object factory', (mode) => {
  const build = (): FactorySchema => {
    const { id, name } = createGenerators()
    return mode === 'readonly' ? new ReadonlyModelObjectFactory(id, name) : new ModelObjectFactory(id, name)
  }

  it.each(cases)(
    '$label checks exclusions and only the forbidding version mutates them',
    ({ create, prefix, type }) => {
      const factory = build()
      const params: FactoryCaseParamsSchema = {
        forbiddenIds: new Set([`${prefix}-1`]),
        forbiddenNames: new Set(['Name 1']),
      }
      const first = create(factory, params)
      expect(first.type).toBe(type)
      expect(first.id).toBe(`${prefix}-2`)
      expect(params.forbiddenIds).toEqual(new Set(mode === 'readonly' ? [`${prefix}-1`] : [`${prefix}-1`, first.id]))
      if ('name' in first) {
        expect(first.name).toBe('Name 2')
        expect(params.forbiddenNames).toEqual(new Set(mode === 'readonly' ? ['Name 1'] : ['Name 1', first.name]))
      } else {
        expect(params.forbiddenNames).toEqual(new Set(['Name 1']))
      }
      const second = create(factory, params)
      if ('children' in first && 'children' in second) {
        expect(first.children).not.toBe(second.children)
      }
      if ('fields' in first && 'fields' in second) {
        expect(first.fields).not.toBe(second.fields)
      }
      expect(second.id).toBe(`${prefix}-${mode === 'readonly' ? 2 : 3}`)
      const fresh = create(factory, { forbiddenIds: new Set(), forbiddenNames: new Set() })
      expect(fresh.id).toBe(`${prefix}-1`)
      if ('name' in fresh) {
        expect(fresh.name).toBe('Name 1')
      }
    },
  )

  it.each(['root-panel', 'panel', 'pocket-cluster', 'front-pocket', 't-pocket'] as const)(
    'dispatches %s components and preserves supplied references and color',
    (type) => {
      const factory = build()
      const component = factory.createComponent({
        type,
        stitchingSettings: defaultStitchingSettings,
        openingId: 'opening',
        color: '#123456',
        forbiddenIds: new Set(),
        forbiddenNames: new Set(),
      })
      expect(component.type).toBe(type)
      expect(component.color).toBe('#123456')
      if (component.type === 'front-pocket' || component.type === 't-pocket') {
        expect(component.openingId).toBe('opening')
      } else {
        expect(component).not.toHaveProperty('openingId')
      }
    },
  )

  it.each(['straight', 'recessed', 'slanted', 'optical-illusion'] as const)('dispatches %s openings', (type) => {
    expect(build().createPocketOpening({ type, forbiddenIds: new Set(), forbiddenNames: new Set() }).type).toBe(type)
  })

  it.each(['component-bounds-stitch-line', 't-pocket-stitch-line'] as const)(
    'dispatches %s stitches and preserves targets',
    (type) => {
      expect(
        build().createStitchLine({
          type,
          targetId: 'owner',
          targetType: 'component',
          forbiddenIds: new Set(),
          forbiddenNames: new Set(),
        }),
      ).toMatchObject({ type, targetId: 'owner', targetType: 'component' })
    },
  )

  it('dispatches equality constraints without creating a name or relation', () => {
    const { id, name } = createGenerators()
    const getName = vi.spyOn(name, 'get')
    const factory = mode === 'readonly' ? new ReadonlyModelObjectFactory(id, name) : new ModelObjectFactory(id, name)
    const constraint = factory.createConstraint({
      type: 'equal-constraint',
      forbiddenIds: new Set(),
    })
    expect(constraint).toEqual({ id: 'equal-constraint-1', type: 'equal-constraint', fields: [] })
    expect(getName).not.toHaveBeenCalled()
  })

  it('does not reserve supplied reference IDs', () => {
    const params: FactoryCaseParamsSchema = { forbiddenIds: new Set(), forbiddenNames: new Set() }
    const factory = build()
    expect(factory.createFrontPocket({ ...params, openingId: 'existing-opening' }).openingId).toBe('existing-opening')
    expect(factory.createHole({ ...params, componentId: 'existing-component' }).componentId).toBe('existing-component')
    expect(
      factory.createComponentBoundsStitchLine({ ...params, targetType: 'hole', targetId: 'existing-hole' }),
    ).toMatchObject({ targetId: 'existing-hole', targetType: 'hole' })
    expect(
      factory.createPanelConstraintField({
        forbiddenIds: params.forbiddenIds,
        type: 'panel-constraint-field',
        modelId: 'existing-panel',
        field: 'width',
      }),
    ).toMatchObject({
      modelId: 'existing-panel',
      field: 'width',
    })
    for (const reference of ['existing-opening', 'existing-component', 'existing-hole', 'existing-panel']) {
      expect(params.forbiddenIds.has(reference)).toBe(false)
    }
  })

  it('rejects missing pocket references and unsupported stitch targets before reserving anything', () => {
    const factory = build()
    const params: FactoryCaseParamsSchema = { forbiddenIds: new Set(), forbiddenNames: new Set() }
    for (const type of ['front-pocket', 't-pocket'] as const) {
      expect(() => factory.createComponent({ ...params, type, stitchingSettings: defaultStitchingSettings })).toThrow(
        'opening ID is required',
      )
    }
    expect(() =>
      factory.createStitchLine({ ...params, type: 't-pocket-stitch-line', targetType: 'hole', targetId: 'hole' }),
    ).toThrow('cannot target holes')
    expect(params.forbiddenIds.size).toBe(0)
    expect(params.forbiddenNames.size).toBe(0)
  })
})

describe('ReadonlyModelObjectFactory', () => {
  it('supports omitted exclusion sets', () => {
    const { id, name } = createGenerators()
    const factory = new ReadonlyModelObjectFactory(id, name)
    expect(factory.createPanel({})).toEqual({ ...defaultPanel, id: 'panel-1', name: 'Name 1', children: [] })
  })

  it('returns independent arrays without mutating defaults', () => {
    const { id, name } = createGenerators()
    const factory = new ReadonlyModelObjectFactory(id, name)
    const snapshot = structuredClone(defaultPanel)
    const first = factory.createPanel({})
    const second = factory.createPanel({})
    first.children.push('child')
    expect(second.children).toEqual([])
    expect(defaultPanel).toEqual(snapshot)
    const constraint = factory.createEqualConstraint({})
    const otherConstraint = factory.createEqualConstraint({})
    constraint.fields.push({ id: 'field', type: 'panel-constraint-field', modelId: 'panel', field: 'width' })
    expect(otherConstraint.fields).toEqual([])
  })

  it('retains stitch-aligned root dimensions and pocket step', () => {
    const { id, name } = createGenerators()
    const factory = new ReadonlyModelObjectFactory(id, name)
    const stitchingSettings = { ...defaultStitchingSettings, stitchMargin: 4, stitchHoleDistance: 3 }
    expect(factory.createRootPanel({ stitchingSettings })).toMatchObject({ width: 101, height: 101 })
    expect(factory.createPocketCluster({ stitchingSettings }).pocketStep).toBe(12)
  })

  const members: ConstraintFieldSchema[] = [
    { id: 'unused', type: 'root-panel-constraint-field', modelId: 'model', field: 'width' },
    { id: 'unused', type: 'panel-constraint-field', modelId: 'model', field: 'height' },
    { id: 'unused', type: 'pocket-cluster-constraint-field', modelId: 'model', field: 'pocketStep' },
    { id: 'unused', type: 'front-pocket-constraint-field', modelId: 'model', field: 'openingId' },
    { id: 'unused', type: 't-pocket-constraint-field', modelId: 'model', field: 'itemId' },
    { id: 'unused', type: 'hole-constraint-field', modelId: 'model', field: 'xOffset' },
    { id: 'unused', type: 'recessed-constraint-field', modelId: 'model', field: 'depth' },
    { id: 'unused', type: 'slanted-constraint-field', modelId: 'model', field: 'side' },
    { id: 'unused', type: 'optical-illusion-constraint-field', modelId: 'model', field: 'direction' },
    { id: 'unused', type: 'component-bounds-stitch-line-constraint-field', modelId: 'model', field: 'onTop' },
    { id: 'unused', type: 't-pocket-stitch-line-constraint-field', modelId: 'model', field: 'stitchMargin' },
  ]
  it.each(members)('dispatches $type with its corresponding field', (member) => {
    const { id, name } = createGenerators()
    const factory = new ReadonlyModelObjectFactory(id, name)
    const { id: _id, ...input } = member
    const readonlyIds: ReadonlySet<string> = new Set(['existing-id'])
    expect(factory.createConstraintField({ ...input, forbiddenIds: readonlyIds })).toEqual({
      ...member,
      id: `${member.type}-1`,
    })
    expect(readonlyIds).toEqual(new Set(['existing-id']))
    const mutableParams: HasForbiddenIdsSchema = { forbiddenIds: new Set() }
    const mutableFactory = new ModelObjectFactory(id, name)
    const created = mutableFactory.createConstraintField({ ...input, ...mutableParams })
    expect(created).toEqual({ ...member, id: `${member.type}-1` })
    expect(mutableParams.forbiddenIds).toEqual(new Set([created.id]))
  })
})

it('preserves the public return types and the discriminator-to-field association', () => {
  expectTypeOf<ReadonlyModelObjectFactorySchema['createPanel']>().returns.toEqualTypeOf<PanelSchema>()
  expectTypeOf<ModelObjectFactorySchema['createPanel']>().returns.toEqualTypeOf<PanelSchema>()
  expectTypeOf({}).toExtend<ReadonlyCreatePanelParamsSchema>()
  expectTypeOf({}).not.toExtend<CreatePanelParamsSchema>()
  expectTypeOf<{
    type: 'panel-constraint-field'
    modelId: string
    field: 'width'
  }>().toExtend<ReadonlyCreateConstraintFieldParamsSchema>()
  expectTypeOf<{
    type: 'panel-constraint-field'
    modelId: string
    field: 'openingId'
  }>().not.toExtend<ReadonlyCreateConstraintFieldParamsSchema>()
  expectTypeOf<{
    type: 'hole-constraint-field'
    modelId: string
    field: 'openingId'
  }>().not.toExtend<ReadonlyCreateConstraintFieldParamsSchema>()
})

it('requires name exclusions only for objects that have a name', () => {
  expectTypeOf<{ forbiddenIds: Set<string> }>().toExtend<CreateEqualConstraintParamsSchema>()
  expectTypeOf<{ forbiddenIds: Set<string> }>().not.toExtend<CreatePanelParamsSchema>()
  expectTypeOf({}).toExtend<ReadonlyCreateEqualConstraintParamsSchema>()
  expectTypeOf<'forbiddenNames'>().not.toExtend<keyof CreateEqualConstraintParamsSchema>()
  expectTypeOf<'forbiddenNames'>().not.toExtend<keyof ReadonlyCreateEqualConstraintParamsSchema>()
  expectTypeOf<'forbiddenNames'>().not.toExtend<keyof CreatePanelConstraintFieldParamsSchema>()
  expectTypeOf<'forbiddenNames'>().not.toExtend<keyof ReadonlyCreatePanelConstraintFieldParamsSchema>()
  expectTypeOf<{
    forbiddenIds: Set<string>
    type: 'panel-constraint-field'
    modelId: string
    field: 'width'
  }>().toExtend<CreatePanelConstraintFieldParamsSchema>()
  expectTypeOf<{
    forbiddenIds: Set<string>
    modelId: string
    field: 'width'
  }>().not.toExtend<CreatePanelConstraintFieldParamsSchema>()
})
