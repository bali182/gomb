import { describe, expect, it } from 'vitest'
import type { ConstraintFieldInputSchema, ReadonlyModelObjectFactorySchema } from '../../schemas/factory'
import type { SubProjectSchema } from '../../schemas/subProject'
import { d } from '../../testData'
import { EN } from '../../translations/en'
import { NameGenerator } from '../../utils/factory/NameGenerator'
import { ReadonlyModelObjectFactory } from '../../utils/factory/ReadonlyModelObjectFactory'
import { getSubProjectIds } from '../../utils/idCollectorUtils'
import { IdGenerator } from '../../utils/random/IdGenerator'
import { addConstraintFields } from './addConstraintFields'
import { deleteConstraint } from './deleteConstraint'
import { deleteConstraintField } from './deleteConstraintField'

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
    constraints: { constraint: { id: 'constraint', type: 'equal-constraint', fields: [] } },
  })

describe('addConstraintFields', () => {
  it('creates a batch through the factory and accepts compatible number fields across models', () => {
    const source = fixture()
    const snapshot = structuredClone(source)
    const result = addConstraintFields(source, {
      constraintId: 'constraint',
      fields: [
        { type: 'panel-constraint-field', modelId: 'panel', field: 'width' },
        { type: 'hole-constraint-field', modelId: 'hole', field: 'height' },
      ],
      modelFactory,
    })
    expect(result.constraints.constraint.fields).toHaveLength(2)
    expect(new Set(result.constraints.constraint.fields.map((field) => field.id)).size).toBe(2)
    const originalIds = getSubProjectIds(source)
    for (const field of result.constraints.constraint.fields) {
      expect(originalIds.has(field.id)).toBe(false)
      expect(field.id.startsWith(`${field.type}-`)).toBe(true)
    }
    expect(source).toEqual(snapshot)
    expect(result.components).toBe(source.components)
  })

  const rejected: ConstraintFieldInputSchema[] = [
    { type: 'panel-constraint-field', modelId: 'missing', field: 'height' },
    { type: 'panel-constraint-field', modelId: 'hole', field: 'height' },
    { type: 'panel-constraint-field', modelId: 'auto', field: 'width' },
    { type: 'panel-constraint-field', modelId: 'panel', field: 'width' },
    { type: 'panel-constraint-field', modelId: 'panel', field: 'layoutOrientation' },
  ]
  it.each(rejected)(
    'rejects missing, mistyped, automatic, duplicate or incompatible fields: $modelId.$field',
    (field) => {
      const source = addConstraintFields(fixture(), {
        constraintId: 'constraint',
        fields: [{ type: 'panel-constraint-field', modelId: 'panel', field: 'width' }],
        modelFactory,
      })
      const snapshot = structuredClone(source)
      expect(addConstraintFields(source, { constraintId: 'constraint', fields: [field], modelFactory })).toBe(source)
      expect(source).toEqual(snapshot)
    },
  )

  it('only links optional stitching settings with the same setting', () => {
    const source = addConstraintFields(fixture(), {
      constraintId: 'constraint',
      fields: [
        { type: 'component-bounds-stitch-line-constraint-field', modelId: 'first-stitch', field: 'stitchMargin' },
      ],
      modelFactory,
    })
    const result = addConstraintFields(source, {
      constraintId: 'constraint',
      fields: [
        { type: 'component-bounds-stitch-line-constraint-field', modelId: 'second-stitch', field: 'stitchMargin' },
      ],
      modelFactory,
    })
    expect(result.constraints.constraint.fields).toHaveLength(2)
    expect(
      addConstraintFields(source, {
        constraintId: 'constraint',
        fields: [
          {
            type: 'component-bounds-stitch-line-constraint-field',
            modelId: 'second-stitch',
            field: 'stitchHoleLength',
          },
          { type: 'panel-constraint-field', modelId: 'panel', field: 'height' },
        ],
        modelFactory,
      }),
    ).toBe(source)
  })

  it('rejects a field already belonging to another constraint without changing the source', () => {
    const first = addConstraintFields(fixture(), {
      constraintId: 'constraint',
      fields: [{ type: 'panel-constraint-field', modelId: 'panel', field: 'width' }],
      modelFactory,
    })
    const source: SubProjectSchema = {
      ...first,
      constraints: { ...first.constraints, other: { id: 'other', type: 'equal-constraint', fields: [] } },
    }
    const snapshot = structuredClone(source)
    expect(
      addConstraintFields(source, {
        constraintId: 'other',
        fields: [{ type: 'panel-constraint-field', modelId: 'panel', field: 'width' }],
        modelFactory,
      }),
    ).toBe(source)
    expect(source).toEqual(snapshot)
  })

  it('accepts a different compatible field of the same model in another constraint', () => {
    const first = addConstraintFields(fixture(), {
      constraintId: 'constraint',
      fields: [{ type: 'panel-constraint-field', modelId: 'panel', field: 'width' }],
      modelFactory,
    })
    const source: SubProjectSchema = {
      ...first,
      constraints: {
        ...first.constraints,
        other: {
          id: 'other',
          type: 'equal-constraint',
          fields: [{ id: 'hole-height', type: 'hole-constraint-field', modelId: 'hole', field: 'height' }],
        },
      },
    }
    const result = addConstraintFields(source, {
      constraintId: 'other',
      fields: [{ type: 'panel-constraint-field', modelId: 'panel', field: 'height' }],
      modelFactory,
    })
    expect(result.constraints.other.fields).toHaveLength(2)
    expect(result.constraints.other.fields[1]).toMatchObject({ modelId: 'panel', field: 'height' })
    expect(result.constraints.constraint).toBe(source.constraints.constraint)
  })

  it.each(['field', 'constraint'])('accepts a field again after its %s is deleted', (removed) => {
    const first = addConstraintFields(fixture(), {
      constraintId: 'constraint',
      fields: [{ type: 'panel-constraint-field', modelId: 'panel', field: 'width' }],
      modelFactory,
    })
    const source: SubProjectSchema = {
      ...first,
      constraints: { ...first.constraints, other: { id: 'other', type: 'equal-constraint', fields: [] } },
    }
    const snapshot = structuredClone(source)
    const available =
      removed === 'field'
        ? deleteConstraintField(source, {
            constraintId: 'constraint',
            fieldId: first.constraints.constraint.fields[0].id,
          })
        : deleteConstraint(source, { constraintId: 'constraint' })
    const result = addConstraintFields(available, {
      constraintId: 'other',
      fields: [{ type: 'panel-constraint-field', modelId: 'panel', field: 'width' }],
      modelFactory,
    })
    expect(result.constraints.other.fields).toHaveLength(1)
    expect(result.constraints.other.fields[0]).toMatchObject({ modelId: 'panel', field: 'width' })
    expect(source).toEqual(snapshot)
  })

  it('leaves the source unchanged if the constraint was removed', () => {
    const source = fixture()
    expect(
      addConstraintFields(source, {
        constraintId: 'missing',
        fields: [{ type: 'panel-constraint-field', modelId: 'panel', field: 'width' }],
        modelFactory,
      }),
    ).toBe(source)
  })

  it('skips invalid and duplicate inputs while accepting compatible fields in input order', () => {
    const source = fixture()
    const snapshot = structuredClone(source)
    const result = addConstraintFields(source, {
      constraintId: 'constraint',
      fields: [
        { type: 'panel-constraint-field', modelId: 'missing', field: 'width' },
        { type: 'panel-constraint-field', modelId: 'panel', field: 'width' },
        { type: 'panel-constraint-field', modelId: 'panel', field: 'width' },
        { type: 'panel-constraint-field', modelId: 'auto', field: 'width' },
        { type: 'panel-constraint-field', modelId: 'panel', field: 'layoutOrientation' },
        { type: 'hole-constraint-field', modelId: 'hole', field: 'height' },
      ],
      modelFactory,
    })
    expect(result.constraints.constraint.fields.map((field) => [field.modelId, field.field])).toEqual([
      ['panel', 'width'],
      ['hole', 'height'],
    ])
    expect(source).toEqual(snapshot)
  })

  it('keeps optional stitching settings in separate compatibility groups within a batch', () => {
    const result = addConstraintFields(fixture(), {
      constraintId: 'constraint',
      fields: [
        { type: 'component-bounds-stitch-line-constraint-field', modelId: 'first-stitch', field: 'stitchMargin' },
        { type: 'component-bounds-stitch-line-constraint-field', modelId: 'second-stitch', field: 'stitchHoleLength' },
        { type: 'component-bounds-stitch-line-constraint-field', modelId: 'second-stitch', field: 'stitchMargin' },
      ],
      modelFactory,
    })
    expect(result.constraints.constraint.fields.map((field) => field.field)).toEqual(['stitchMargin', 'stitchMargin'])
  })

  it('returns the original subproject for an empty or entirely invalid batch', () => {
    const source = fixture()
    expect(addConstraintFields(source, { constraintId: 'constraint', fields: [], modelFactory })).toBe(source)
    expect(
      addConstraintFields(source, {
        constraintId: 'constraint',
        fields: [
          { type: 'panel-constraint-field', modelId: 'missing', field: 'width' },
          { type: 'panel-constraint-field', modelId: 'auto', field: 'width' },
        ],
        modelFactory,
      }),
    ).toBe(source)
  })
})
