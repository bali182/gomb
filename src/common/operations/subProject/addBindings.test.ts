import { describe, expect, it } from 'vitest'
import { applyResolution } from '../../logic/bindings/applyResolution'
import type { BindingFieldInputSchema } from '../../schemas/factory'
import type { AddBindingWithFieldsParamsSchema } from '../../schemas/operations'
import type { SubProjectSchema } from '../../schemas/subProject'
import { d } from '../../testData'
import { accessors } from '../../utils/accessors'
import { getSubProjectDiff } from '../../utils/getSubProjectDiff'
import { getSubProjectIds } from '../../utils/idCollectorUtils'
import { addBindings } from './addBindings'
import { createBaseOperationParams } from './testUtils'

const fixture = (): SubProjectSchema =>
  d.subProject({
    frontFace: d.rootPanelFace({ id: 'root-front', children: ['first', 'second', 'auto'] }),
    id: 'sub',
    root: d.rootPanel({ id: 'root' }),
    components: [
      d.panel({ id: 'first', width: 100, height: 50, autoWidth: false, autoHeight: false }),
      d.panel({ id: 'second', width: 200, height: 75, autoWidth: false, autoHeight: false }),
      d.panel({ id: 'auto', autoWidth: true }),
    ],
  })

const width: AddBindingWithFieldsParamsSchema = {
  type: 'equal-binding',
  fields: [
    { type: 'panel-binding-field', modelId: 'first', field: 'width' },
    { type: 'panel-binding-field', modelId: 'second', field: 'width' },
  ],
}
const height: AddBindingWithFieldsParamsSchema = {
  type: 'equal-binding',
  fields: [
    { type: 'panel-binding-field', modelId: 'first', field: 'height' },
    { type: 'panel-binding-field', modelId: 'second', field: 'height' },
  ],
}

describe('addBindings', () => {
  it('creates the complete batch with source-first fields, unique ids and no input mutation', () => {
    const source = fixture()
    const snapshot = structuredClone(source)
    const result = addBindings(createBaseOperationParams(source), { bindings: [width, height] })
    const bindings = Object.values(result.bindings)
    expect(bindings).toHaveLength(2)
    expect(bindings.map((binding) => binding.fields.map((field) => field.field))).toEqual([
      ['width', 'width'],
      ['height', 'height'],
    ])
    for (const binding of bindings) {
      expect(binding.fields.map((field) => field.modelId)).toEqual(['first', 'second'])
    }
    const ids = bindings.flatMap((binding) => [binding.id, ...binding.fields.map((field) => field.id)])
    expect(new Set(ids).size).toBe(6)
    const sourceIds = getSubProjectIds(source)
    expect(ids.every((id) => !sourceIds.has(id))).toBe(true)
    expect(result.components).toBe(source.components)
    expect(source).toEqual(snapshot)
  })

  it('uses the opening model values when resolving every new binding', () => {
    const source = fixture()
    const updated = addBindings(createBaseOperationParams(source), { bindings: [width, height] })
    const resolved = applyResolution({ input: updated, target: updated, inputDiff: getSubProjectDiff(source, updated) })
    const accessor = accessors.subProject(resolved)
    expect(accessor.component.panel('first').width).toBe(100)
    expect(accessor.component.panel('second').width).toBe(100)
    expect(accessor.component.panel('first').height).toBe(50)
    expect(accessor.component.panel('second').height).toBe(50)
  })

  it('returns the same subproject for an empty batch', () => {
    const source = fixture()
    expect(addBindings(createBaseOperationParams(source), { bindings: [] })).toBe(source)
  })

  const invalid: BindingFieldInputSchema[] = [
    { type: 'panel-binding-field', modelId: 'missing', field: 'width' },
    { type: 'panel-binding-field', modelId: 'auto', field: 'width' },
    { type: 'panel-binding-field', modelId: 'first', field: 'layoutOrientation' },
    { type: 'panel-binding-field', modelId: 'first', field: 'height' },
    { type: 'hole-binding-field', modelId: 'second', field: 'width' },
  ]
  it.each(invalid)('rejects an invalid batch without retaining earlier additions: $modelId.$field', (field) => {
    const source = fixture()
    const snapshot = structuredClone(source)
    const result = addBindings(createBaseOperationParams(source), {
      bindings: [height, { type: 'equal-binding', fields: [width.fields[0], field] }],
    })
    expect(result).toBe(source)
    expect(source).toEqual(snapshot)
  })

  it('rejects fields already bound in a previous operation or the same batch', () => {
    const original = fixture()
    const source = addBindings(createBaseOperationParams(original), { bindings: [width] })
    expect(addBindings(createBaseOperationParams(source), { bindings: [height, width] })).toBe(source)
    expect(addBindings(createBaseOperationParams(original), { bindings: [width, width] })).toBe(original)
  })

  it('rejects duplicate fields and bindings with fewer than two fields', () => {
    const source = fixture()
    for (const fields of [[], [width.fields[0]], [width.fields[0], width.fields[0]]]) {
      expect(
        addBindings(createBaseOperationParams(source), {
          bindings: [height, { type: 'equal-binding', fields }],
        }),
      ).toBe(source)
    }
  })

  it('keeps existing bindings when adding a different field', () => {
    const original = fixture()
    const source = addBindings(createBaseOperationParams(original), { bindings: [width] })
    const result = addBindings(createBaseOperationParams(source), { bindings: [height] })
    for (const [id, binding] of Object.entries(source.bindings)) {
      expect(result.bindings[id]).toBe(binding)
    }
    expect(Object.values(result.bindings)).toHaveLength(2)
  })
})
