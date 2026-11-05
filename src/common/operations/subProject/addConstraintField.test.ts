import { describe, expect, it } from 'vitest'
import type { ConstraintFieldInputSchema, ReadonlyModelObjectFactorySchema } from '../../schemas/factory'
import type { SubProjectSchema } from '../../schemas/subProject'
import { d } from '../../testData'
import { EN } from '../../translations/en'
import { NameGenerator } from '../../utils/factory/NameGenerator'
import { ReadonlyModelObjectFactory } from '../../utils/factory/ReadonlyModelObjectFactory'
import { getSubProjectIds } from '../../utils/idCollectorUtils'
import { IdGenerator } from '../../utils/random/IdGenerator'
import { addConstraintField } from './addConstraintField'

const modelFactory: ReadonlyModelObjectFactorySchema = new ReadonlyModelObjectFactory(
  new IdGenerator(),
  new NameGenerator(EN.defaultNames),
)
const fixture = (): SubProjectSchema =>
  d.subProject({
    id: 'sub',
    root: d.rootPanel({ id: 'root', children: ['panel', 'auto'] }),
    components: [d.panel({ id: 'panel', autoWidth: false }), d.panel({ id: 'auto', autoWidth: true })],
    holes: [d.hole({ id: 'hole', componentId: 'panel' })],
    stitchLines: [
      d.componentBoundsStitchLine({ id: 'first-stitch', targetId: 'panel', targetType: 'component' }),
      d.componentBoundsStitchLine({ id: 'second-stitch', targetId: 'hole', targetType: 'hole' }),
    ],
    constraints: { constraint: { id: 'constraint', type: 'equal-constraint', fields: [] } },
  })

describe('addConstraintField', () => {
  it('creates members through the factory and accepts matching number fields across models', () => {
    const source = fixture()
    const snapshot = structuredClone(source)
    const first = addConstraintField(source, {
      constraintId: 'constraint',
      field: { type: 'panel-constraint-field', modelId: 'panel', field: 'width' },
      modelFactory,
    })
    const result = addConstraintField(first, {
      constraintId: 'constraint',
      field: { type: 'hole-constraint-field', modelId: 'hole', field: 'height' },
      modelFactory,
    })
    expect(result.constraints.constraint.fields).toHaveLength(2)
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
    'rejects missing, mistyped, automatic, duplicate or incompatible members: $modelId.$field',
    (field) => {
      const source = addConstraintField(fixture(), {
        constraintId: 'constraint',
        field: { type: 'panel-constraint-field', modelId: 'panel', field: 'width' },
        modelFactory,
      })
      const snapshot = structuredClone(source)
      expect(addConstraintField(source, { constraintId: 'constraint', field, modelFactory })).toBe(source)
      expect(source).toEqual(snapshot)
    },
  )

  it('only links optional stitching settings with the same setting', () => {
    const source = addConstraintField(fixture(), {
      constraintId: 'constraint',
      field: { type: 'component-bounds-stitch-line-constraint-field', modelId: 'first-stitch', field: 'stitchMargin' },
      modelFactory,
    })
    const result = addConstraintField(source, {
      constraintId: 'constraint',
      field: { type: 'component-bounds-stitch-line-constraint-field', modelId: 'second-stitch', field: 'stitchMargin' },
      modelFactory,
    })
    expect(result.constraints.constraint.fields).toHaveLength(2)
    expect(
      addConstraintField(source, {
        constraintId: 'constraint',
        field: {
          type: 'component-bounds-stitch-line-constraint-field',
          modelId: 'second-stitch',
          field: 'stitchHoleLength',
        },
        modelFactory,
      }),
    ).toBe(source)
    expect(
      addConstraintField(source, {
        constraintId: 'constraint',
        field: { type: 'panel-constraint-field', modelId: 'panel', field: 'height' },
        modelFactory,
      }),
    ).toBe(source)
  })

  it('leaves the source unchanged if the constraint was removed', () => {
    const source = fixture()
    expect(
      addConstraintField(source, {
        constraintId: 'missing',
        field: { type: 'panel-constraint-field', modelId: 'panel', field: 'width' },
        modelFactory,
      }),
    ).toBe(source)
  })
})
