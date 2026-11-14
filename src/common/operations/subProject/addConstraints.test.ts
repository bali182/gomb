import { describe, expect, it } from 'vitest'
import { applyResolution } from '../../logic/constraints/applyResolution'
import type { ConstraintFieldInputSchema } from '../../schemas/factory'
import type { AddConstraintWithFieldsParamsSchema } from '../../schemas/operations'
import type { SubProjectSchema } from '../../schemas/subProject'
import { d } from '../../testData'
import { accessors } from '../../utils/accessors'
import { getSubProjectDiff } from '../../utils/getSubProjectDiff'
import { getSubProjectIds } from '../../utils/idCollectorUtils'
import { addConstraints } from './addConstraints'
import { createBaseOperationParams } from './testUtils'

const fixture = (): SubProjectSchema =>
  d.subProject({
    id: 'sub',
    root: d.rootPanel({ id: 'root', children: ['first', 'second', 'auto'] }),
    components: [
      d.panel({ id: 'first', width: 100, height: 50, autoWidth: false, autoHeight: false }),
      d.panel({ id: 'second', width: 200, height: 75, autoWidth: false, autoHeight: false }),
      d.panel({ id: 'auto', autoWidth: true }),
    ],
  })

const width: AddConstraintWithFieldsParamsSchema = {
  type: 'equal-constraint',
  fields: [
    { type: 'panel-constraint-field', modelId: 'first', field: 'width' },
    { type: 'panel-constraint-field', modelId: 'second', field: 'width' },
  ],
}
const height: AddConstraintWithFieldsParamsSchema = {
  type: 'equal-constraint',
  fields: [
    { type: 'panel-constraint-field', modelId: 'first', field: 'height' },
    { type: 'panel-constraint-field', modelId: 'second', field: 'height' },
  ],
}

describe('addConstraints', () => {
  it('creates the complete batch with source-first fields, unique ids and no input mutation', () => {
    const source = fixture()
    const snapshot = structuredClone(source)
    const result = addConstraints(createBaseOperationParams(source), { constraints: [width, height] })
    const constraints = Object.values(result.constraints)
    expect(constraints).toHaveLength(2)
    expect(constraints.map((constraint) => constraint.fields.map((field) => field.field))).toEqual([
      ['width', 'width'],
      ['height', 'height'],
    ])
    for (const constraint of constraints) {
      expect(constraint.fields.map((field) => field.modelId)).toEqual(['first', 'second'])
    }
    const ids = constraints.flatMap((constraint) => [constraint.id, ...constraint.fields.map((field) => field.id)])
    expect(new Set(ids).size).toBe(6)
    const sourceIds = getSubProjectIds(source)
    expect(ids.every((id) => !sourceIds.has(id))).toBe(true)
    expect(result.components).toBe(source.components)
    expect(source).toEqual(snapshot)
  })

  it('uses the opening model values when resolving every new constraint', () => {
    const source = fixture()
    const updated = addConstraints(createBaseOperationParams(source), { constraints: [width, height] })
    const resolved = applyResolution({ input: updated, target: updated, inputDiff: getSubProjectDiff(source, updated) })
    const accessor = accessors.subProject(resolved)
    expect(accessor.component.panel('first').width).toBe(100)
    expect(accessor.component.panel('second').width).toBe(100)
    expect(accessor.component.panel('first').height).toBe(50)
    expect(accessor.component.panel('second').height).toBe(50)
  })

  it('returns the same subproject for an empty batch', () => {
    const source = fixture()
    expect(addConstraints(createBaseOperationParams(source), { constraints: [] })).toBe(source)
  })

  const invalid: ConstraintFieldInputSchema[] = [
    { type: 'panel-constraint-field', modelId: 'missing', field: 'width' },
    { type: 'panel-constraint-field', modelId: 'auto', field: 'width' },
    { type: 'panel-constraint-field', modelId: 'first', field: 'layoutOrientation' },
    { type: 'panel-constraint-field', modelId: 'first', field: 'height' },
    { type: 'hole-constraint-field', modelId: 'second', field: 'width' },
  ]
  it.each(invalid)('rejects an invalid batch without retaining earlier additions: $modelId.$field', (field) => {
    const source = fixture()
    const snapshot = structuredClone(source)
    const result = addConstraints(createBaseOperationParams(source), {
      constraints: [height, { type: 'equal-constraint', fields: [width.fields[0], field] }],
    })
    expect(result).toBe(source)
    expect(source).toEqual(snapshot)
  })

  it('rejects fields already constrained in a previous operation or the same batch', () => {
    const original = fixture()
    const source = addConstraints(createBaseOperationParams(original), { constraints: [width] })
    expect(addConstraints(createBaseOperationParams(source), { constraints: [height, width] })).toBe(source)
    expect(addConstraints(createBaseOperationParams(original), { constraints: [width, width] })).toBe(original)
  })

  it('rejects duplicate fields and constraints with fewer than two fields', () => {
    const source = fixture()
    for (const fields of [[], [width.fields[0]], [width.fields[0], width.fields[0]]]) {
      expect(
        addConstraints(createBaseOperationParams(source), {
          constraints: [height, { type: 'equal-constraint', fields }],
        }),
      ).toBe(source)
    }
  })

  it('keeps existing constraints when adding a different field', () => {
    const original = fixture()
    const source = addConstraints(createBaseOperationParams(original), { constraints: [width] })
    const result = addConstraints(createBaseOperationParams(source), { constraints: [height] })
    for (const [id, constraint] of Object.entries(source.constraints)) {
      expect(result.constraints[id]).toBe(constraint)
    }
    expect(Object.values(result.constraints)).toHaveLength(2)
  })
})
