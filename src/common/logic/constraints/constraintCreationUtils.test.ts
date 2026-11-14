import { describe, expect, it } from 'vitest'
import { createBaseOperationParams } from '../../operations/subProject/testUtils'
import type { SubProjectSchema } from '../../schemas/subProject'
import { d } from '../../testData'
import { getCommonConstraintProperties, getValidConstraintPropertySelection } from './constraintCreationUtils'

const first = d.panel({ id: 'first', name: 'First', autoWidth: false, autoHeight: false, autoLayoutGap: false })
const second = d.panel({ id: 'second', name: 'Second', autoWidth: false, autoHeight: false, autoLayoutGap: false })
const source = d.subProject({
  id: 'sub',
  root: d.rootPanel({ id: 'root', children: ['first', 'second'] }),
  components: [first, second],
})

describe('getCommonConstraintProperties', () => {
  it('returns no properties for an empty selection and the source properties for one model', () => {
    expect(getCommonConstraintProperties(source, [])).toEqual([])
    expect(getCommonConstraintProperties(source, [first]).map((property) => property.field)).toContain('width')
  })

  it('keeps the source first and preserves its property order', () => {
    const properties = getCommonConstraintProperties(source, [first, second])
    expect(properties.slice(0, 2).map((property) => property.field)).toEqual(['width', 'height'])
    expect(properties[0].fields.map((field) => field.modelId)).toEqual(['first', 'second'])
    expect(properties[0].blockers).toEqual([])
  })

  it('narrows the intersection across all selected models and restores it when a model is removed', () => {
    const frontPocket = d.frontPocket({ id: 'front', openingId: 'opening' })
    const hole = d.hole({ id: 'hole', componentId: 'first' })
    const tPocket = d.tPocket({ id: 'back', openingId: 'opening' })
    const pair = getCommonConstraintProperties(source, [frontPocket, hole])
    expect(pair.map((property) => property.field)).toEqual([
      'topLeftRadius',
      'topRightRadius',
      'bottomLeftRadius',
      'bottomRightRadius',
    ])
    expect(getCommonConstraintProperties(source, [frontPocket, tPocket]).length).toBeGreaterThan(0)
    expect(getCommonConstraintProperties(source, [frontPocket, hole, tPocket])).toEqual([])
    expect(getCommonConstraintProperties(source, [frontPocket, hole])).toEqual(pair)
  })

  it('intersects by field name rather than merely by value compatibility', () => {
    const opening = createBaseOperationParams(source).readonlyFactory.createSlantedPocketOpening({})
    const hole = d.hole({ id: 'hole', componentId: 'first' })
    expect(getCommonConstraintProperties(source, [opening, hole])).toEqual([])
  })

  it('supports component, hole and stitch line radii and opening properties', () => {
    const hole = d.hole({ id: 'hole', componentId: 'first' })
    const stitchLine = d.componentBoundsStitchLine({
      id: 'stitch',
      targetId: 'first',
      targetType: 'component',
      autoCornerRadius: false,
    })
    const radius = getCommonConstraintProperties(source, [first, hole, stitchLine]).find(
      (property) => property.field === 'topLeftRadius',
    )
    expect(radius?.fields.map((field) => field.type)).toEqual([
      'panel-constraint-field',
      'hole-constraint-field',
      'component-bounds-stitch-line-constraint-field',
    ])
    expect(radius?.blockers).toEqual([])
    const openings = getCommonConstraintProperties(source, [
      createBaseOperationParams(source).readonlyFactory.createRecessedPocketOpening({}),
      createBaseOperationParams(source).readonlyFactory.createRecessedPocketOpening({}),
    ])
    expect(openings.map((property) => property.field)).toContain('depth')
    expect(
      getCommonConstraintProperties(source, [
        createBaseOperationParams(source).readonlyFactory.createStraightPocketOpening({}),
      ]),
    ).toEqual([])
  })

  it('keeps constrained and automatic fields and identifies every affected model and reason', () => {
    const automatic = { ...first, autoWidth: true, autoLayoutGap: true }
    const constrained: SubProjectSchema = {
      ...source,
      constraints: {
        existing: {
          id: 'existing',
          type: 'equal-constraint',
          fields: [
            { id: 'one', type: 'panel-constraint-field', modelId: first.id, field: 'width' },
            { id: 'two', type: 'panel-constraint-field', modelId: second.id, field: 'width' },
          ],
        },
      },
    }
    const properties = getCommonConstraintProperties(constrained, [automatic, second])
    expect(properties.find((property) => property.field === 'width')?.blockers).toEqual([
      { model: automatic, alreadyConstrained: true, autoReason: 'auto-width' },
      { model: second, alreadyConstrained: true, autoReason: undefined },
    ])
    expect(properties.find((property) => property.field === 'layoutGap')?.blockers).toEqual([
      { model: automatic, alreadyConstrained: false, autoReason: 'auto-layout-gap' },
    ])
    expect(properties.find((property) => property.field === 'height')?.blockers).toEqual([])
  })
})

describe('getValidConstraintPropertySelection', () => {
  it('drops disappeared and disabled properties while preserving valid selections', () => {
    const automatic = { ...second, autoWidth: true }
    const properties = getCommonConstraintProperties(source, [first, automatic])
    expect(getValidConstraintPropertySelection(properties, ['width', 'height', 'depth'])).toEqual(['height'])
    expect(getValidConstraintPropertySelection([], ['width'])).toEqual([])
    expect(getValidConstraintPropertySelection(properties, [])).toEqual([])
  })
})
