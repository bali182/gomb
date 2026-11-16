import { describe, expect, it } from 'vitest'
import { createBaseOperationParams } from '../../operations/subProject/testUtils'
import type { SubProjectSchema } from '../../schemas/subProject'
import { d } from '../../testData'
import { getCommonBindingProperties, getValidBindingPropertySelection } from './bindingCreationUtils'

const first = d.panel({ id: 'first', name: 'First', autoWidth: false, autoHeight: false, autoLayoutGap: false })
const second = d.panel({ id: 'second', name: 'Second', autoWidth: false, autoHeight: false, autoLayoutGap: false })
const source = d.subProject({
  id: 'sub',
  root: d.rootPanel({ id: 'root', children: ['first', 'second'] }),
  components: [first, second],
})

describe('getCommonBindingProperties', () => {
  it('returns no properties for an empty selection and the source properties for one model', () => {
    expect(getCommonBindingProperties(source, [])).toEqual([])
    expect(getCommonBindingProperties(source, [first]).map((property) => property.field)).toContain('width')
  })

  it('keeps the source first and preserves its property order', () => {
    const properties = getCommonBindingProperties(source, [first, second])
    expect(properties.slice(0, 2).map((property) => property.field)).toEqual(['width', 'height'])
    expect(properties[0].fields.map((field) => field.modelId)).toEqual(['first', 'second'])
    expect(properties[0].blockers).toEqual([])
  })

  it('narrows the intersection across all selected models and restores it when a model is removed', () => {
    const frontPocket = d.frontPocket({ id: 'front', openingId: 'opening' })
    const hole = d.hole({ id: 'hole', componentId: 'first' })
    const tPocket = d.tPocket({ id: 'back', openingId: 'opening' })
    const pair = getCommonBindingProperties(source, [frontPocket, hole])
    expect(pair.map((property) => property.field)).toEqual([
      'topLeftRadius',
      'topRightRadius',
      'bottomLeftRadius',
      'bottomRightRadius',
    ])
    expect(getCommonBindingProperties(source, [frontPocket, tPocket]).length).toBeGreaterThan(0)
    expect(getCommonBindingProperties(source, [frontPocket, hole, tPocket])).toEqual([])
    expect(getCommonBindingProperties(source, [frontPocket, hole])).toEqual(pair)
  })

  it('intersects by field name rather than merely by value compatibility', () => {
    const opening = createBaseOperationParams(source).readonlyFactory.createSlantedPocketOpening({})
    const hole = d.hole({ id: 'hole', componentId: 'first' })
    expect(getCommonBindingProperties(source, [opening, hole])).toEqual([])
  })

  it('supports component, hole and stitch line radii and opening properties', () => {
    const hole = d.hole({ id: 'hole', componentId: 'first' })
    const stitchLine = d.componentBoundsStitchLine({
      id: 'stitch',
      targetId: 'first',
      targetType: 'component',
      autoCornerRadius: false,
    })
    const radius = getCommonBindingProperties(source, [first, hole, stitchLine]).find(
      (property) => property.field === 'topLeftRadius',
    )
    expect(radius?.fields.map((field) => field.type)).toEqual([
      'panel-binding-field',
      'hole-binding-field',
      'component-bounds-stitch-line-binding-field',
    ])
    expect(radius?.blockers).toEqual([])
    const openings = getCommonBindingProperties(source, [
      createBaseOperationParams(source).readonlyFactory.createRecessedPocketOpening({}),
      createBaseOperationParams(source).readonlyFactory.createRecessedPocketOpening({}),
    ])
    expect(openings.map((property) => property.field)).toContain('recessDepth')
    expect(
      getCommonBindingProperties(source, [
        createBaseOperationParams(source).readonlyFactory.createStraightPocketOpening({}),
      ]),
    ).toEqual([])
  })

  it('keeps bound and automatic fields and identifies every affected model and reason', () => {
    const automatic = { ...first, autoWidth: true, autoLayoutGap: true }
    const bound: SubProjectSchema = {
      ...source,
      bindings: {
        existing: {
          id: 'existing',
          type: 'equal-binding',
          fields: [
            { id: 'one', type: 'panel-binding-field', modelId: first.id, field: 'width' },
            { id: 'two', type: 'panel-binding-field', modelId: second.id, field: 'width' },
          ],
        },
      },
    }
    const properties = getCommonBindingProperties(bound, [automatic, second])
    expect(properties.find((property) => property.field === 'width')?.blockers).toEqual([
      { model: automatic, alreadyBound: true, autoReason: 'auto-width' },
      { model: second, alreadyBound: true, autoReason: undefined },
    ])
    expect(properties.find((property) => property.field === 'layoutGap')?.blockers).toEqual([
      { model: automatic, alreadyBound: false, autoReason: 'auto-layout-gap' },
    ])
    expect(properties.find((property) => property.field === 'height')?.blockers).toEqual([])
  })
})

describe('getValidBindingPropertySelection', () => {
  it('drops disappeared and disabled properties while preserving valid selections', () => {
    const automatic = { ...second, autoWidth: true }
    const properties = getCommonBindingProperties(source, [first, automatic])
    expect(getValidBindingPropertySelection(properties, ['width', 'height', 'recessDepth'])).toEqual(['height'])
    expect(getValidBindingPropertySelection([], ['width'])).toEqual([])
    expect(getValidBindingPropertySelection(properties, [])).toEqual([])
  })
})
