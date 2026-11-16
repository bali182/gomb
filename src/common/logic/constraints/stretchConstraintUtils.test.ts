import { describe, expect, it } from 'vitest'
import type { HasStretchSchema } from '../../schemas/common'
import type { ConstraintSchema } from '../../schemas/constraints'
import type { SubProjectSchema } from '../../schemas/subProject'
import { d } from '../../testData'
import { STRETCH_FIELD_ORDER, getStretchConstraintState } from './stretchConstraintUtils'

const fixture = (constraints: Record<string, ConstraintSchema> = {}): SubProjectSchema =>
  d.subProject({
    id: 'sub',
    root: d.rootPanel({ id: 'root', children: ['panel', 'cluster', 'pocket'] }),
    components: [
      d.panel({ id: 'panel' }),
      d.pocketCluster({ id: 'cluster' }),
      d.tPocket({ id: 'pocket' }),
    ],
    holes: [d.hole({ id: 'hole', componentId: 'panel' })],
    constraints,
  })

const binding = (id: string, fields: readonly (keyof HasStretchSchema)[]): ConstraintSchema => ({
  id,
  type: 'equal-constraint',
  fields: fields.map((field) => ({
    id: id + '-' + field,
    type: 'panel-constraint-field',
    modelId: 'panel',
    field,
  })),
})

describe('getStretchConstraintState', () => {
  it('starts with four available sides on panels and pocket clusters', () => {
    const source = fixture()
    for (const modelId of ['panel', 'cluster']) {
      expect(getStretchConstraintState(source, modelId)).toEqual({
        constraint: undefined,
        disabledFields: [],
        hasMultipleConstraints: false,
      })
    }
  })

  it('recognizes a single binding between opposite sides', () => {
    const constraint = binding('vertical', ['topStretch', 'bottomStretch'])
    expect(getStretchConstraintState(fixture({ vertical: constraint }), 'panel')).toEqual({
      constraint,
      disabledFields: [],
      hasMultipleConstraints: false,
    })
  })

  it('blocks opening when two separate internal bindings exist', () => {
    const source = fixture({
      vertical: binding('vertical', ['topStretch', 'bottomStretch']),
      horizontal: binding('horizontal', ['leftStretch', 'rightStretch']),
    })
    expect(getStretchConstraintState(source, 'panel')).toEqual({
      constraint: undefined,
      disabledFields: [],
      hasMultipleConstraints: true,
    })
  })

  it('disables sides bound to another component or to a different field of the same component', () => {
    const externalModel = binding('external-model', ['topStretch'])
    externalModel.fields.push({
      id: 'root-width',
      type: 'root-panel-constraint-field',
      modelId: 'root',
      field: 'width',
    })
    const externalField = binding('external-field', ['rightStretch'])
    externalField.fields.push({
      id: 'panel-radius',
      type: 'panel-constraint-field',
      modelId: 'panel',
      field: 'topLeftRadius',
    })
    const internal = binding('internal', ['bottomStretch', 'leftStretch'])
    const source = fixture({
      'external-model': externalModel,
      'external-field': externalField,
      internal,
    })
    expect(getStretchConstraintState(source, 'panel')).toEqual({
      constraint: internal,
      disabledFields: ['topStretch', 'rightStretch'],
      hasMultipleConstraints: false,
    })
  })

  it('ignores bindings that do not contain any stretch field', () => {
    const constraint: ConstraintSchema = {
      id: 'width',
      type: 'equal-constraint',
      fields: [{ id: 'panel-width', type: 'panel-constraint-field', modelId: 'panel', field: 'width' }],
    }
    expect(getStretchConstraintState(fixture({ width: constraint }), 'panel')).toEqual({
      constraint: undefined,
      disabledFields: [],
      hasMultipleConstraints: false,
    })
  })

  it('disables all sides when one external binding contains all of them', () => {
    const external = binding('external', STRETCH_FIELD_ORDER)
    external.fields.push({
      id: 'root-width',
      type: 'root-panel-constraint-field',
      modelId: 'root',
      field: 'width',
    })
    expect(getStretchConstraintState(fixture({ external }), 'panel')).toEqual({
      constraint: undefined,
      disabledFields: STRETCH_FIELD_ORDER,
      hasMultipleConstraints: false,
    })
  })

  it.each(['missing', 'root', 'hole', 'pocket'])('returns no state for unsupported model %s', (modelId) => {
    expect(getStretchConstraintState(fixture(), modelId)).toBeUndefined()
  })
})
