import { describe, expect, it } from 'vitest'
import type { BindingFieldSchema } from '../../schemas/constraints'
import type { SubProjectSchema } from '../../schemas/subProject'
import { d } from '../../testData'
import { deleteModelConstraintFields } from './deleteModelConstraintFields'
import { createBaseOperationParams } from './testUtils'

const fixture = (): SubProjectSchema =>
  d.subProject({
    id: 'sub',
    root: d.rootPanel({ id: 'root', children: ['panel'] }),
    components: [d.panel({ id: 'panel', children: ['child'] }), d.panel({ id: 'child' })],
    holes: [d.hole({ id: 'hole', componentId: 'panel' })],
    stitchLines: [d.componentBoundsStitchLine({ id: 'stitch', targetType: 'component', targetId: 'panel' })],
    pocketOpenings: [{ id: 'opening', name: 'Opening', type: 'slanted', slantOffset: 10, slantSide: 'start' }],
    constraints: {
      width: {
        id: 'width',
        type: 'equal-constraint',
        fields: [
          { id: 'panel-width', type: 'panel-constraint-field', modelId: 'panel', field: 'width' },
          { id: 'root-width', type: 'root-panel-constraint-field', modelId: 'root', field: 'width' },
        ],
      },
      height: {
        id: 'height',
        type: 'equal-constraint',
        fields: [{ id: 'panel-height', type: 'panel-constraint-field', modelId: 'panel', field: 'height' }],
      },
      unrelated: {
        id: 'unrelated',
        type: 'equal-constraint',
        fields: [
          { id: 'child-width', type: 'panel-constraint-field', modelId: 'child', field: 'width' },
          { id: 'hole-width', type: 'hole-constraint-field', modelId: 'hole', field: 'width' },
        ],
      },
      stitching: {
        id: 'stitching',
        type: 'equal-constraint',
        fields: [
          {
            id: 'stitch-margin',
            type: 'component-bounds-stitch-line-constraint-field',
            modelId: 'stitch',
            field: 'stitchMargin',
          },
        ],
      },
      empty: { id: 'empty', type: 'equal-constraint', fields: [] },
    },
  })

describe('deleteModelConstraintFields', () => {
  it('removes all matching fields across constraints and deletes only constraints that become empty', () => {
    const source = fixture()
    const snapshot = structuredClone(source)
    const result = deleteModelConstraintFields(createBaseOperationParams(source), { modelId: 'panel' })

    expect(result.constraints.width.fields).toEqual([source.constraints.width.fields[1]])
    expect(result.constraints.width.fields[0]).toBe(source.constraints.width.fields[1])
    expect(result.constraints).not.toHaveProperty('height')
    expect(result.constraints.unrelated).toBe(source.constraints.unrelated)
    expect(result.constraints.stitching).toBe(source.constraints.stitching)
    expect(result.constraints.empty).toBe(source.constraints.empty)
    expect(result.components).toBe(source.components)
    expect(result.holes).toBe(source.holes)
    expect(result.stitchLines).toBe(source.stitchLines)
    expect(result.pocketOpenings).toBe(source.pocketOpenings)
    expect(source).toEqual(snapshot)
  })

  it('removes multiple different properties of the model from the same constraint', () => {
    const source = fixture()
    source.constraints.width.fields.push(source.constraints.height.fields[0])
    const result = deleteModelConstraintFields(createBaseOperationParams(source), { modelId: 'panel' })
    expect(result.constraints.width.fields).toEqual([source.constraints.width.fields[1]])
  })

  it.each(['missing', 'opening'])('returns the original subproject when %s has no fields', (modelId) => {
    const source = fixture()
    expect(deleteModelConstraintFields(createBaseOperationParams(source), { modelId })).toBe(source)
  })

  const fields: BindingFieldSchema[] = [
    { id: 'root-field', type: 'root-panel-constraint-field', modelId: 'root', field: 'height' },
    { id: 'panel-field', type: 'panel-constraint-field', modelId: 'panel', field: 'height' },
    { id: 'hole-field', type: 'hole-constraint-field', modelId: 'hole', field: 'height' },
    {
      id: 'stitch-field',
      type: 'component-bounds-stitch-line-constraint-field',
      modelId: 'stitch',
      field: 'startOffset',
    },
    { id: 'opening-field', type: 'slanted-constraint-field', modelId: 'opening', field: 'slantOffset' },
  ]

  it.each(fields)('supports $type', (field) => {
    const source: SubProjectSchema = {
      ...fixture(),
      constraints: {
        only: { id: 'only', type: 'equal-constraint', fields: [field] },
      },
    }
    const result = deleteModelConstraintFields(createBaseOperationParams(source), { modelId: field.modelId })
    expect(result.constraints).toEqual({})
    expect(source.constraints.only.fields).toEqual([field])
  })
})
