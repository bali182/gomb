import { describe, expect, it } from 'vitest'
import type { BindingFieldInputSchema, ReadonlyModelObjectFactorySchema } from '../../schemas/factory'
import type { SubProjectSchema } from '../../schemas/subProject'
import { d } from '../../testData'
import { EN } from '../../translations/en'
import { NameGenerator } from '../../utils/factory/NameGenerator'
import { ReadonlyModelObjectFactory } from '../../utils/factory/ReadonlyModelObjectFactory'
import { getSubProjectIds } from '../../utils/idCollectorUtils'
import { IdGenerator } from '../../utils/random/IdGenerator'
import { addBindingFields } from './addBindingFields'
import { deleteBinding } from './deleteBinding'
import { deleteBindingField } from './deleteBindingField'
import { createBaseOperationParams } from './testUtils'

const modelFactory: ReadonlyModelObjectFactorySchema = new ReadonlyModelObjectFactory(
  new IdGenerator(),
  new NameGenerator(EN.defaultNames),
)
const fixture = (): SubProjectSchema =>
  d.subProject({
    id: 'sub',
    root: d.rootPanel({ id: 'root', children: ['panel', 'auto'] }),
    components: [
      d.panel({ id: 'panel', autoWidth: false, autoHeight: false }),
      d.panel({ id: 'auto', autoWidth: true }),
    ],
    holes: [d.hole({ id: 'hole', componentId: 'panel' })],
    stitchLines: [
      d.componentBoundsStitchLine({ id: 'first-stitch', targetId: 'panel', targetType: 'component' }),
      d.componentBoundsStitchLine({ id: 'second-stitch', targetId: 'hole', targetType: 'hole' }),
    ],
    bindings: { binding: { id: 'binding', type: 'equal-binding', fields: [] } },
  })

describe('addBindingFields', () => {
  it.each([
    'top',
    'right',
    'bottom',
    'left',
    'topLeftCorner',
    'topRightCorner',
    'bottomRightCorner',
    'bottomLeftCorner',
  ])('rejects stitched side/corner field %s', (field) => {
    const source = fixture()
    const input = {
      type: 'component-bounds-stitch-line-binding-field',
      modelId: 'first-stitch',
      field,
    } as unknown as BindingFieldInputSchema
    const result = addBindingFields(createBaseOperationParams(source, { readonlyFactory: modelFactory }), {
      bindingId: 'binding',
      fields: [input],
    })
    expect(result).toBe(source)
    expect(result.bindings.binding.fields).toEqual([])
  })

  it('creates a batch through the factory and accepts compatible number fields across models', () => {
    const source = fixture()
    const snapshot = structuredClone(source)
    const result = addBindingFields(createBaseOperationParams(source, { readonlyFactory: modelFactory }), {
      bindingId: 'binding',
      fields: [
        { type: 'panel-binding-field', modelId: 'panel', field: 'width' },
        { type: 'hole-binding-field', modelId: 'hole', field: 'height' },
      ],
    })
    expect(result.bindings.binding.fields).toHaveLength(2)
    expect(new Set(result.bindings.binding.fields.map((field) => field.id)).size).toBe(2)
    const originalIds = getSubProjectIds(source)
    for (const field of result.bindings.binding.fields) {
      expect(originalIds.has(field.id)).toBe(false)
      expect(field.id.startsWith(`${field.type}-`)).toBe(true)
    }
    expect(source).toEqual(snapshot)
    expect(result.components).toBe(source.components)
  })

  const rejected: BindingFieldInputSchema[] = [
    { type: 'panel-binding-field', modelId: 'missing', field: 'height' },
    { type: 'panel-binding-field', modelId: 'hole', field: 'height' },
    { type: 'panel-binding-field', modelId: 'auto', field: 'width' },
    { type: 'panel-binding-field', modelId: 'panel', field: 'width' },
    { type: 'panel-binding-field', modelId: 'panel', field: 'layoutOrientation' },
  ]
  it.each(rejected)(
    'rejects missing, mistyped, automatic, duplicate or incompatible fields: $modelId.$field',
    (field) => {
      const source = addBindingFields(createBaseOperationParams(fixture(), { readonlyFactory: modelFactory }), {
        bindingId: 'binding',
        fields: [{ type: 'panel-binding-field', modelId: 'panel', field: 'width' }],
      })
      const snapshot = structuredClone(source)
      expect(
        addBindingFields(createBaseOperationParams(source, { readonlyFactory: modelFactory }), {
          bindingId: 'binding',
          fields: [field],
        }),
      ).toBe(source)
      expect(source).toEqual(snapshot)
    },
  )

  it('only links optional stitching settings with the same setting', () => {
    const source = addBindingFields(createBaseOperationParams(fixture(), { readonlyFactory: modelFactory }), {
      bindingId: 'binding',
      fields: [{ type: 'component-bounds-stitch-line-binding-field', modelId: 'first-stitch', field: 'stitchMargin' }],
    })
    const result = addBindingFields(createBaseOperationParams(source, { readonlyFactory: modelFactory }), {
      bindingId: 'binding',
      fields: [{ type: 'component-bounds-stitch-line-binding-field', modelId: 'second-stitch', field: 'stitchMargin' }],
    })
    expect(result.bindings.binding.fields).toHaveLength(2)
    expect(
      addBindingFields(createBaseOperationParams(source, { readonlyFactory: modelFactory }), {
        bindingId: 'binding',
        fields: [
          {
            type: 'component-bounds-stitch-line-binding-field',
            modelId: 'second-stitch',
            field: 'stitchHoleLength',
          },
          { type: 'panel-binding-field', modelId: 'panel', field: 'height' },
        ],
      }),
    ).toBe(source)
  })

  it('rejects a field already belonging to another binding without changing the source', () => {
    const first = addBindingFields(createBaseOperationParams(fixture(), { readonlyFactory: modelFactory }), {
      bindingId: 'binding',
      fields: [{ type: 'panel-binding-field', modelId: 'panel', field: 'width' }],
    })
    const source: SubProjectSchema = {
      ...first,
      bindings: { ...first.bindings, other: { id: 'other', type: 'equal-binding', fields: [] } },
    }
    const snapshot = structuredClone(source)
    expect(
      addBindingFields(createBaseOperationParams(source, { readonlyFactory: modelFactory }), {
        bindingId: 'other',
        fields: [{ type: 'panel-binding-field', modelId: 'panel', field: 'width' }],
      }),
    ).toBe(source)
    expect(source).toEqual(snapshot)
  })

  it('accepts a different compatible field of the same model in another binding', () => {
    const first = addBindingFields(createBaseOperationParams(fixture(), { readonlyFactory: modelFactory }), {
      bindingId: 'binding',
      fields: [{ type: 'panel-binding-field', modelId: 'panel', field: 'width' }],
    })
    const source: SubProjectSchema = {
      ...first,
      bindings: {
        ...first.bindings,
        other: {
          id: 'other',
          type: 'equal-binding',
          fields: [{ id: 'hole-height', type: 'hole-binding-field', modelId: 'hole', field: 'height' }],
        },
      },
    }
    const result = addBindingFields(createBaseOperationParams(source, { readonlyFactory: modelFactory }), {
      bindingId: 'other',
      fields: [{ type: 'panel-binding-field', modelId: 'panel', field: 'height' }],
    })
    expect(result.bindings.other.fields).toHaveLength(2)
    expect(result.bindings.other.fields[1]).toMatchObject({ modelId: 'panel', field: 'height' })
    expect(result.bindings.binding).toBe(source.bindings.binding)
  })

  it.each(['field', 'binding'])('accepts a field again after its %s is deleted', (removed) => {
    const first = addBindingFields(createBaseOperationParams(fixture(), { readonlyFactory: modelFactory }), {
      bindingId: 'binding',
      fields: [{ type: 'panel-binding-field', modelId: 'panel', field: 'width' }],
    })
    const source: SubProjectSchema = {
      ...first,
      bindings: { ...first.bindings, other: { id: 'other', type: 'equal-binding', fields: [] } },
    }
    const snapshot = structuredClone(source)
    const available =
      removed === 'field'
        ? deleteBindingField(createBaseOperationParams(source), {
            bindingId: 'binding',
            id: first.bindings.binding.fields[0].id,
          })
        : deleteBinding(createBaseOperationParams(source), { id: 'binding' })
    const result = addBindingFields(createBaseOperationParams(available, { readonlyFactory: modelFactory }), {
      bindingId: 'other',
      fields: [{ type: 'panel-binding-field', modelId: 'panel', field: 'width' }],
    })
    expect(result.bindings.other.fields).toHaveLength(1)
    expect(result.bindings.other.fields[0]).toMatchObject({ modelId: 'panel', field: 'width' })
    expect(source).toEqual(snapshot)
  })

  it('leaves the source unchanged if the binding was removed', () => {
    const source = fixture()
    expect(
      addBindingFields(createBaseOperationParams(source, { readonlyFactory: modelFactory }), {
        bindingId: 'missing',
        fields: [{ type: 'panel-binding-field', modelId: 'panel', field: 'width' }],
      }),
    ).toBe(source)
  })

  it('skips invalid and duplicate inputs while accepting compatible fields in input order', () => {
    const source = fixture()
    const snapshot = structuredClone(source)
    const result = addBindingFields(createBaseOperationParams(source, { readonlyFactory: modelFactory }), {
      bindingId: 'binding',
      fields: [
        { type: 'panel-binding-field', modelId: 'missing', field: 'width' },
        { type: 'panel-binding-field', modelId: 'panel', field: 'width' },
        { type: 'panel-binding-field', modelId: 'panel', field: 'width' },
        { type: 'panel-binding-field', modelId: 'auto', field: 'width' },
        { type: 'panel-binding-field', modelId: 'panel', field: 'layoutOrientation' },
        { type: 'hole-binding-field', modelId: 'hole', field: 'height' },
      ],
    })
    expect(result.bindings.binding.fields.map((field) => [field.modelId, field.field])).toEqual([
      ['panel', 'width'],
      ['hole', 'height'],
    ])
    expect(source).toEqual(snapshot)
  })

  it('keeps optional stitching settings in separate compatibility groups within a batch', () => {
    const result = addBindingFields(createBaseOperationParams(fixture(), { readonlyFactory: modelFactory }), {
      bindingId: 'binding',
      fields: [
        { type: 'component-bounds-stitch-line-binding-field', modelId: 'first-stitch', field: 'stitchMargin' },
        { type: 'component-bounds-stitch-line-binding-field', modelId: 'second-stitch', field: 'stitchHoleLength' },
        { type: 'component-bounds-stitch-line-binding-field', modelId: 'second-stitch', field: 'stitchMargin' },
      ],
    })
    expect(result.bindings.binding.fields.map((field) => field.field)).toEqual(['stitchMargin', 'stitchMargin'])
  })

  it('returns the original subproject for an empty or entirely invalid batch', () => {
    const source = fixture()
    expect(
      addBindingFields(createBaseOperationParams(source, { readonlyFactory: modelFactory }), {
        bindingId: 'binding',
        fields: [],
      }),
    ).toBe(source)
    expect(
      addBindingFields(createBaseOperationParams(source, { readonlyFactory: modelFactory }), {
        bindingId: 'binding',
        fields: [
          { type: 'panel-binding-field', modelId: 'missing', field: 'width' },
          { type: 'panel-binding-field', modelId: 'auto', field: 'width' },
        ],
      }),
    ).toBe(source)
  })
})
