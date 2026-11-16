import { describe, expect, it } from 'vitest'
import type { BindingFieldSchema } from '../../schemas/bindings'
import type { SubProjectSchema } from '../../schemas/subProject'
import { d } from '../../testData'
import { deleteModelBindingFields } from './deleteModelBindingFields'
import { createBaseOperationParams } from './testUtils'

const fixture = (): SubProjectSchema =>
  d.subProject({
    id: 'sub',
    root: d.rootPanel({ id: 'root', children: ['panel'] }),
    components: [d.panel({ id: 'panel', children: ['child'] }), d.panel({ id: 'child' })],
    holes: [d.hole({ id: 'hole', componentId: 'panel' })],
    stitchLines: [d.componentBoundsStitchLine({ id: 'stitch', targetType: 'component', targetId: 'panel' })],
    pocketOpenings: [{ id: 'opening', name: 'Opening', type: 'slanted', slantOffset: 10, slantSide: 'start' }],
    bindings: {
      width: {
        id: 'width',
        type: 'equal-binding',
        fields: [
          { id: 'panel-width', type: 'panel-binding-field', modelId: 'panel', field: 'width' },
          { id: 'root-width', type: 'root-panel-binding-field', modelId: 'root', field: 'width' },
        ],
      },
      height: {
        id: 'height',
        type: 'equal-binding',
        fields: [{ id: 'panel-height', type: 'panel-binding-field', modelId: 'panel', field: 'height' }],
      },
      unrelated: {
        id: 'unrelated',
        type: 'equal-binding',
        fields: [
          { id: 'child-width', type: 'panel-binding-field', modelId: 'child', field: 'width' },
          { id: 'hole-width', type: 'hole-binding-field', modelId: 'hole', field: 'width' },
        ],
      },
      stitching: {
        id: 'stitching',
        type: 'equal-binding',
        fields: [
          {
            id: 'stitch-margin',
            type: 'component-bounds-stitch-line-binding-field',
            modelId: 'stitch',
            field: 'stitchMargin',
          },
        ],
      },
      empty: { id: 'empty', type: 'equal-binding', fields: [] },
    },
  })

describe('deleteModelBindingFields', () => {
  it('removes all matching fields across bindings and deletes only bindings that become empty', () => {
    const source = fixture()
    const snapshot = structuredClone(source)
    const result = deleteModelBindingFields(createBaseOperationParams(source), { modelId: 'panel' })

    expect(result.bindings.width.fields).toEqual([source.bindings.width.fields[1]])
    expect(result.bindings.width.fields[0]).toBe(source.bindings.width.fields[1])
    expect(result.bindings).not.toHaveProperty('height')
    expect(result.bindings.unrelated).toBe(source.bindings.unrelated)
    expect(result.bindings.stitching).toBe(source.bindings.stitching)
    expect(result.bindings.empty).toBe(source.bindings.empty)
    expect(result.components).toBe(source.components)
    expect(result.holes).toBe(source.holes)
    expect(result.stitchLines).toBe(source.stitchLines)
    expect(result.pocketOpenings).toBe(source.pocketOpenings)
    expect(source).toEqual(snapshot)
  })

  it('removes multiple different properties of the model from the same binding', () => {
    const source = fixture()
    source.bindings.width.fields.push(source.bindings.height.fields[0])
    const result = deleteModelBindingFields(createBaseOperationParams(source), { modelId: 'panel' })
    expect(result.bindings.width.fields).toEqual([source.bindings.width.fields[1]])
  })

  it.each(['missing', 'opening'])('returns the original subproject when %s has no fields', (modelId) => {
    const source = fixture()
    expect(deleteModelBindingFields(createBaseOperationParams(source), { modelId })).toBe(source)
  })

  const fields: BindingFieldSchema[] = [
    { id: 'root-field', type: 'root-panel-binding-field', modelId: 'root', field: 'height' },
    { id: 'panel-field', type: 'panel-binding-field', modelId: 'panel', field: 'height' },
    { id: 'hole-field', type: 'hole-binding-field', modelId: 'hole', field: 'height' },
    {
      id: 'stitch-field',
      type: 'component-bounds-stitch-line-binding-field',
      modelId: 'stitch',
      field: 'startOffset',
    },
    { id: 'opening-field', type: 'slanted-binding-field', modelId: 'opening', field: 'slantOffset' },
  ]

  it.each(fields)('supports $type', (field) => {
    const source: SubProjectSchema = {
      ...fixture(),
      bindings: {
        only: { id: 'only', type: 'equal-binding', fields: [field] },
      },
    }
    const result = deleteModelBindingFields(createBaseOperationParams(source), { modelId: field.modelId })
    expect(result.bindings).toEqual({})
    expect(source.bindings.only.fields).toEqual([field])
  })
})
