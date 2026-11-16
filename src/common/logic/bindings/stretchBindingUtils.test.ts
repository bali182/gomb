import { describe, expect, it } from 'vitest'
import type { BindingSchema } from '../../schemas/bindings'
import type { HasStretchSchema } from '../../schemas/common'
import type { SubProjectSchema } from '../../schemas/subProject'
import { d } from '../../testData'
import { STRETCH_FIELD_ORDER, getStretchBindingState } from './stretchBindingUtils'

const fixture = (bindings: Record<string, BindingSchema> = {}): SubProjectSchema =>
  d.subProject({
    id: 'sub',
    root: d.rootPanel({ id: 'root', children: ['panel', 'cluster', 'pocket'] }),
    components: [d.panel({ id: 'panel' }), d.pocketCluster({ id: 'cluster' }), d.tPocket({ id: 'pocket' })],
    holes: [d.hole({ id: 'hole', componentId: 'panel' })],
    bindings,
  })

const createBinding = (id: string, fields: readonly (keyof HasStretchSchema)[]): BindingSchema => ({
  id,
  type: 'equal-binding',
  fields: fields.map((field) => ({
    id: id + '-' + field,
    type: 'panel-binding-field',
    modelId: 'panel',
    field,
  })),
})

describe('getStretchBindingState', () => {
  it('starts with four available sides on panels and pocket clusters', () => {
    const source = fixture()
    for (const modelId of ['panel', 'cluster']) {
      expect(getStretchBindingState(source, modelId)).toEqual({
        binding: undefined,
        disabledFields: [],
        hasMultipleBindings: false,
      })
    }
  })

  it('recognizes a single binding between opposite sides', () => {
    const binding = createBinding('vertical', ['topStretch', 'bottomStretch'])
    expect(getStretchBindingState(fixture({ vertical: binding }), 'panel')).toEqual({
      binding,
      disabledFields: [],
      hasMultipleBindings: false,
    })
  })

  it('blocks opening when two separate internal bindings exist', () => {
    const source = fixture({
      vertical: createBinding('vertical', ['topStretch', 'bottomStretch']),
      horizontal: createBinding('horizontal', ['leftStretch', 'rightStretch']),
    })
    expect(getStretchBindingState(source, 'panel')).toEqual({
      binding: undefined,
      disabledFields: [],
      hasMultipleBindings: true,
    })
  })

  it('disables sides bound to another component or to a different field of the same component', () => {
    const externalModel = createBinding('external-model', ['topStretch'])
    externalModel.fields.push({
      id: 'root-width',
      type: 'root-panel-binding-field',
      modelId: 'root',
      field: 'width',
    })
    const externalField = createBinding('external-field', ['rightStretch'])
    externalField.fields.push({
      id: 'panel-radius',
      type: 'panel-binding-field',
      modelId: 'panel',
      field: 'topLeftRadius',
    })
    const internal = createBinding('internal', ['bottomStretch', 'leftStretch'])
    const source = fixture({
      'external-model': externalModel,
      'external-field': externalField,
      internal,
    })
    expect(getStretchBindingState(source, 'panel')).toEqual({
      binding: internal,
      disabledFields: ['topStretch', 'rightStretch'],
      hasMultipleBindings: false,
    })
  })

  it('ignores bindings that do not contain any stretch field', () => {
    const binding: BindingSchema = {
      id: 'width',
      type: 'equal-binding',
      fields: [{ id: 'panel-width', type: 'panel-binding-field', modelId: 'panel', field: 'width' }],
    }
    expect(getStretchBindingState(fixture({ width: binding }), 'panel')).toEqual({
      binding: undefined,
      disabledFields: [],
      hasMultipleBindings: false,
    })
  })

  it('disables all sides when one external binding contains all of them', () => {
    const external = createBinding('external', STRETCH_FIELD_ORDER)
    external.fields.push({
      id: 'root-width',
      type: 'root-panel-binding-field',
      modelId: 'root',
      field: 'width',
    })
    expect(getStretchBindingState(fixture({ external }), 'panel')).toEqual({
      binding: undefined,
      disabledFields: STRETCH_FIELD_ORDER,
      hasMultipleBindings: false,
    })
  })

  it.each(['missing', 'root', 'hole', 'pocket'])('returns no state for unsupported model %s', (modelId) => {
    expect(getStretchBindingState(fixture(), modelId)).toBeUndefined()
  })
})
