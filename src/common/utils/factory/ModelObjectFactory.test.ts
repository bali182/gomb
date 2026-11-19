import { describe, expect, expectTypeOf, it, vi } from 'vitest'
import { defaultPanel, defaultStitchingSettings } from '../../defaultStates'
import type { BindingFieldSchema } from '../../schemas/bindings'
import type { PanelSchema } from '../../schemas/components'
import type {
  CreateEqualBindingParamsSchema,
  CreatePanelBindingFieldParamsSchema,
  CreatePanelParamsSchema,
  HasForbiddenIdsSchema,
  HasForbiddenNamesSchema,
  ModelObjectFactorySchema,
  ReadonlyCreateBindingFieldParamsSchema,
  ReadonlyCreateEqualBindingParamsSchema,
  ReadonlyCreatePanelBindingFieldParamsSchema,
  ReadonlyCreatePanelParamsSchema,
  ReadonlyModelObjectFactorySchema,
} from '../../schemas/factory'
import type { IdPrefixSchema } from '../../schemas/idGenerator'
import type { ModelObjectSchema } from '../../schemas/modelObject'
import type { SubProjectItemSchema } from '../../schemas/subProject'
import { isDefined } from '../isDefined'
import { IdGenerator } from '../random/IdGenerator'
import { ModelObjectFactory } from './ModelObjectFactory'
import { NameGenerator } from './NameGenerator'
import { ReadonlyModelObjectFactory } from './ReadonlyModelObjectFactory'

type FactoryCaseParamsSchema = HasForbiddenIdsSchema & HasForbiddenNamesSchema

type FactorySchema = ReadonlyModelObjectFactorySchema | ModelObjectFactorySchema
type FactoryResultSchema = SubProjectItemSchema | BindingFieldSchema
type FactoryCaseSchema = {
  label: string
  prefix: IdPrefixSchema
  type: FactoryResultSchema['type']
  create: (factory: FactorySchema, params: FactoryCaseParamsSchema) => FactoryResultSchema
}

const translations: Record<IdPrefixSchema, string> = {
  'project': 'Name',
  'sub-project': 'Name',
  'root-panel-face': 'Face',
  'root-panel-face-binding-field': 'Face field',
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
  'equal-binding': 'Name',
  'root-panel-binding-field': 'Name',
  'panel-binding-field': 'Name',
  'pocket-cluster-binding-field': 'Name',
  'front-pocket-binding-field': 'Name',
  't-pocket-binding-field': 'Name',
  'hole-binding-field': 'Name',
  'recessed-binding-field': 'Name',
  'slanted-binding-field': 'Name',
  'optical-illusion-binding-field': 'Name',
  'component-bounds-stitch-line-binding-field': 'Name',
  't-pocket-stitch-line-binding-field': 'Name',
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
    create: (factory, params) =>
      factory.createRootPanel({
        frontFaceId: 'factory-front',
        backFaceId: 'factory-back',
        ...params,
        stitchingSettings: defaultStitchingSettings,
      }),
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
    label: 'createEqualBinding',
    prefix: 'equal-binding',
    type: 'equal-binding',
    create: (factory, params) => factory.createEqualBinding({ forbiddenIds: params.forbiddenIds }),
  },
  {
    label: 'createRootPanelBindingField',
    prefix: 'root-panel-binding-field',
    type: 'root-panel-binding-field',
    create: (factory, params) =>
      factory.createRootPanelBindingField({
        forbiddenIds: params.forbiddenIds,
        type: 'root-panel-binding-field',
        modelId: 'model',
        field: 'width',
      }),
  },
  {
    label: 'createPanelBindingField',
    prefix: 'panel-binding-field',
    type: 'panel-binding-field',
    create: (factory, params) =>
      factory.createPanelBindingField({
        forbiddenIds: params.forbiddenIds,
        type: 'panel-binding-field',
        modelId: 'model',
        field: 'height',
      }),
  },
  {
    label: 'createPocketClusterBindingField',
    prefix: 'pocket-cluster-binding-field',
    type: 'pocket-cluster-binding-field',
    create: (factory, params) =>
      factory.createPocketClusterBindingField({
        forbiddenIds: params.forbiddenIds,
        type: 'pocket-cluster-binding-field',
        modelId: 'model',
        field: 'pocketStep',
      }),
  },
  {
    label: 'createFrontPocketBindingField',
    prefix: 'front-pocket-binding-field',
    type: 'front-pocket-binding-field',
    create: (factory, params) =>
      factory.createFrontPocketBindingField({
        forbiddenIds: params.forbiddenIds,
        type: 'front-pocket-binding-field',
        modelId: 'model',
        field: 'openingId',
      }),
  },
  {
    label: 'createTPocketBindingField',
    prefix: 't-pocket-binding-field',
    type: 't-pocket-binding-field',
    create: (factory, params) =>
      factory.createTPocketBindingField({
        forbiddenIds: params.forbiddenIds,
        type: 't-pocket-binding-field',
        modelId: 'model',
        field: 'itemId',
      }),
  },
  {
    label: 'createHoleBindingField',
    prefix: 'hole-binding-field',
    type: 'hole-binding-field',
    create: (factory, params) =>
      factory.createHoleBindingField({
        forbiddenIds: params.forbiddenIds,
        type: 'hole-binding-field',
        modelId: 'model',
        field: 'xOffset',
      }),
  },
  {
    label: 'createRecessedPocketOpeningBindingField',
    prefix: 'recessed-binding-field',
    type: 'recessed-binding-field',
    create: (factory, params) =>
      factory.createRecessedPocketOpeningBindingField({
        forbiddenIds: params.forbiddenIds,
        type: 'recessed-binding-field',
        modelId: 'model',
        field: 'recessDepth',
      }),
  },
  {
    label: 'createSlantedPocketOpeningBindingField',
    prefix: 'slanted-binding-field',
    type: 'slanted-binding-field',
    create: (factory, params) =>
      factory.createSlantedPocketOpeningBindingField({
        forbiddenIds: params.forbiddenIds,
        type: 'slanted-binding-field',
        modelId: 'model',
        field: 'slantSide',
      }),
  },
  {
    label: 'createOpticalIllusionPocketOpeningBindingField',
    prefix: 'optical-illusion-binding-field',
    type: 'optical-illusion-binding-field',
    create: (factory, params) =>
      factory.createOpticalIllusionPocketOpeningBindingField({
        forbiddenIds: params.forbiddenIds,
        type: 'optical-illusion-binding-field',
        modelId: 'model',
        field: 'illusionSide',
      }),
  },
  {
    label: 'createComponentBoundsStitchLineBindingField',
    prefix: 'component-bounds-stitch-line-binding-field',
    type: 'component-bounds-stitch-line-binding-field',
    create: (factory, params) =>
      factory.createComponentBoundsStitchLineBindingField({
        forbiddenIds: params.forbiddenIds,
        type: 'component-bounds-stitch-line-binding-field',
        modelId: 'model',
        field: 'stitchMargin',
      }),
  },
  {
    label: 'createTPocketStitchLineBindingField',
    prefix: 't-pocket-stitch-line-binding-field',
    type: 't-pocket-stitch-line-binding-field',
    create: (factory, params) =>
      factory.createTPocketStitchLineBindingField({
        forbiddenIds: params.forbiddenIds,
        type: 't-pocket-stitch-line-binding-field',
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
      const namedFirst = getNamedModel(first)
      if (isDefined(namedFirst)) {
        expect(namedFirst.name).toBe('Name 2')
        expect(params.forbiddenNames).toEqual(new Set(mode === 'readonly' ? ['Name 1'] : ['Name 1', namedFirst.name]))
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
      const namedFresh = getNamedModel(fresh)
      if (isDefined(namedFresh)) {
        expect(namedFresh.name).toBe('Name 1')
      }
    },
  )

  it.each(['root-panel', 'panel', 'pocket-cluster', 'front-pocket', 't-pocket'] as const)(
    'dispatches %s components and preserves supplied references and color',
    (type) => {
      const factory = build()
      const component = factory.createComponent({
        type,
        frontFaceId: 'factory-front',
        backFaceId: 'factory-back',
        stitchingSettings: defaultStitchingSettings,
        openingId: 'opening',
        color: '#123456',
        forbiddenIds: new Set(),
        forbiddenNames: new Set(),
      })
      expect(component.type).toBe(type)
      expect(component).toHaveProperty('color', '#123456')
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

  it('preserves an explicit face name and only the forbidding factory reserves it', () => {
    const factory = build()
    const forbiddenIds = new Set<string>()
    const forbiddenNames = new Set<string>()
    const face = factory.createRootPanelFace({ name: 'Front face', forbiddenIds, forbiddenNames })
    expect(face.name).toBe('Front face')
    expect(forbiddenIds.has(face.id)).toBe(mode === 'forbidding')
    expect(forbiddenNames.has('Front face')).toBe(mode === 'forbidding')
    expect(
      factory.createComponent({
        type: 'root-panel-face',
        name: 'Back face',
        forbiddenIds,
        forbiddenNames,
        stitchingSettings: defaultStitchingSettings,
      }).name,
    ).toBe('Back face')
    expect(forbiddenNames.has('Back face')).toBe(mode === 'forbidding')
  })

  it('dispatches equality bindings without creating a name or relation', () => {
    const { id, name } = createGenerators()
    const getName = vi.spyOn(name, 'get')
    const factory = mode === 'readonly' ? new ReadonlyModelObjectFactory(id, name) : new ModelObjectFactory(id, name)
    const binding = factory.createBinding({
      type: 'equal-binding',
      forbiddenIds: new Set(),
    })
    expect(binding).toEqual({ id: 'equal-binding-1', type: 'equal-binding', fields: [] })
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
      factory.createPanelBindingField({
        forbiddenIds: params.forbiddenIds,
        type: 'panel-binding-field',
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
    const binding = factory.createEqualBinding({})
    const otherBinding = factory.createEqualBinding({})
    binding.fields.push({ id: 'field', type: 'panel-binding-field', modelId: 'panel', field: 'width' })
    expect(otherBinding.fields).toEqual([])
  })

  it('retains stitch-aligned root dimensions and pocket step', () => {
    const { id, name } = createGenerators()
    const factory = new ReadonlyModelObjectFactory(id, name)
    const stitchingSettings = { ...defaultStitchingSettings, stitchMargin: 4, stitchHoleDistance: 3 }
    expect(
      factory.createRootPanel({ frontFaceId: 'factory-front', backFaceId: 'factory-back', stitchingSettings }),
    ).toMatchObject({ width: 101, height: 101 })
    expect(factory.createPocketCluster({ stitchingSettings }).pocketStep).toBe(12)
  })

  const members: BindingFieldSchema[] = [
    { id: 'unused', type: 'root-panel-binding-field', modelId: 'model', field: 'width' },
    { id: 'unused', type: 'panel-binding-field', modelId: 'model', field: 'height' },
    { id: 'unused', type: 'pocket-cluster-binding-field', modelId: 'model', field: 'pocketStep' },
    { id: 'unused', type: 'front-pocket-binding-field', modelId: 'model', field: 'openingId' },
    { id: 'unused', type: 't-pocket-binding-field', modelId: 'model', field: 'itemId' },
    { id: 'unused', type: 'hole-binding-field', modelId: 'model', field: 'xOffset' },
    { id: 'unused', type: 'recessed-binding-field', modelId: 'model', field: 'recessDepth' },
    { id: 'unused', type: 'slanted-binding-field', modelId: 'model', field: 'slantSide' },
    { id: 'unused', type: 'optical-illusion-binding-field', modelId: 'model', field: 'illusionSide' },
    { id: 'unused', type: 'component-bounds-stitch-line-binding-field', modelId: 'model', field: 'stitchMargin' },
    { id: 'unused', type: 't-pocket-stitch-line-binding-field', modelId: 'model', field: 'stitchMargin' },
  ]
  it.each(members)('dispatches $type with its corresponding field', (member) => {
    const { id, name } = createGenerators()
    const factory = new ReadonlyModelObjectFactory(id, name)
    const { id: _id, ...input } = member
    const readonlyIds: ReadonlySet<string> = new Set(['existing-id'])
    expect(factory.createBindingField({ ...input, forbiddenIds: readonlyIds })).toEqual({
      ...member,
      id: `${member.type}-1`,
    })
    expect(readonlyIds).toEqual(new Set(['existing-id']))
    const mutableParams: HasForbiddenIdsSchema = { forbiddenIds: new Set() }
    const mutableFactory = new ModelObjectFactory(id, name)
    const created = mutableFactory.createBindingField({ ...input, ...mutableParams })
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
    type: 'panel-binding-field'
    modelId: string
    field: 'width'
  }>().toExtend<ReadonlyCreateBindingFieldParamsSchema>()
  expectTypeOf<{
    type: 'panel-binding-field'
    modelId: string
    field: 'openingId'
  }>().not.toExtend<ReadonlyCreateBindingFieldParamsSchema>()
  expectTypeOf<{
    type: 'hole-binding-field'
    modelId: string
    field: 'openingId'
  }>().not.toExtend<ReadonlyCreateBindingFieldParamsSchema>()
})

it('requires name exclusions only for objects that have a name', () => {
  expectTypeOf<{ forbiddenIds: Set<string> }>().toExtend<CreateEqualBindingParamsSchema>()
  expectTypeOf<{ forbiddenIds: Set<string> }>().not.toExtend<CreatePanelParamsSchema>()
  expectTypeOf({}).toExtend<ReadonlyCreateEqualBindingParamsSchema>()
  expectTypeOf<'forbiddenNames'>().not.toExtend<keyof CreateEqualBindingParamsSchema>()
  expectTypeOf<'forbiddenNames'>().not.toExtend<keyof ReadonlyCreateEqualBindingParamsSchema>()
  expectTypeOf<'forbiddenNames'>().not.toExtend<keyof CreatePanelBindingFieldParamsSchema>()
  expectTypeOf<'forbiddenNames'>().not.toExtend<keyof ReadonlyCreatePanelBindingFieldParamsSchema>()
  expectTypeOf<{
    forbiddenIds: Set<string>
    type: 'panel-binding-field'
    modelId: string
    field: 'width'
  }>().toExtend<CreatePanelBindingFieldParamsSchema>()
  expectTypeOf<{
    forbiddenIds: Set<string>
    modelId: string
    field: 'width'
  }>().not.toExtend<CreatePanelBindingFieldParamsSchema>()
})

const getNamedModel = (model: FactoryResultSchema): ModelObjectSchema | undefined => {
  switch (model.type) {
    case 'root-panel':
    case 'root-panel-face':
    case 'panel':
    case 'pocket-cluster':
    case 'front-pocket':
    case 't-pocket':
    case 'hole':
    case 'component-bounds-stitch-line':
    case 't-pocket-stitch-line':
    case 'straight':
    case 'recessed':
    case 'slanted':
    case 'optical-illusion':
      return model
    case 'equal-binding':
    case 'root-panel-binding-field':
    case 'root-panel-face-binding-field':
    case 'panel-binding-field':
    case 'pocket-cluster-binding-field':
    case 'front-pocket-binding-field':
    case 't-pocket-binding-field':
    case 'hole-binding-field':
    case 'recessed-binding-field':
    case 'slanted-binding-field':
    case 'optical-illusion-binding-field':
    case 'component-bounds-stitch-line-binding-field':
    case 't-pocket-stitch-line-binding-field':
      return undefined
  }
}
