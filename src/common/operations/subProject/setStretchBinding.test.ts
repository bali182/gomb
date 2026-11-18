import { describe, expect, it } from 'vitest'
import { applyResolution } from '../../logic/bindings/applyResolution'
import { STRETCH_FIELD_ORDER } from '../../logic/bindings/stretchBindingUtils'
import type { BindingSchema } from '../../schemas/bindings'
import type { HasStretchSchema } from '../../schemas/common'
import type { SubProjectSchema } from '../../schemas/subProject'
import { d } from '../../testData'
import { accessors } from '../../utils/accessors'
import { getSubProjectDiff } from '../../utils/getSubProjectDiff'
import { getSubProjectIds } from '../../utils/idCollectorUtils'
import { setStretchBinding } from './setStretchBinding'
import { createBaseOperationParams } from './testUtils'

const fixture = (bindings: Record<string, BindingSchema> = {}): SubProjectSchema =>
  d.subProject({
    frontFace: d.rootPanelFace({ id: 'root-front', children: ['panel', 'cluster'] }),
    id: 'sub',
    root: d.rootPanel({ id: 'root' }),
    components: [
      d.panel({ id: 'panel', topStretch: 12, rightStretch: -4, bottomStretch: 6, leftStretch: 2 }),
      d.pocketCluster({ id: 'cluster' }),
    ],
    bindings,
  })

const binding = (id: string, fields: readonly (keyof HasStretchSchema)[]): BindingSchema => ({
  id,
  type: 'equal-binding',
  fields: fields.map((field) => ({
    id: id + '-' + field,
    type: 'panel-binding-field',
    modelId: 'panel',
    field,
  })),
})

describe('setStretchBinding', () => {
  it('creates a binding between opposite sides in canonical order without changing values or the input', () => {
    const source = fixture()
    const snapshot = structuredClone(source)
    const sourceIds = getSubProjectIds(source)
    const result = setStretchBinding(createBaseOperationParams(source), {
      modelId: 'panel',
      fields: ['bottomStretch', 'topStretch'],
    })
    const bindings = Object.values(result.bindings)
    expect(bindings).toHaveLength(1)
    const binding = bindings[0]
    expect(binding.fields.map((field) => field.field)).toEqual(['topStretch', 'bottomStretch'])
    expect(binding.fields.every((field) => field.modelId === 'panel' && field.type === 'panel-binding-field')).toBe(
      true,
    )
    const ids = [binding.id, ...binding.fields.map((field) => field.id)]
    expect(new Set(ids).size).toBe(ids.length)
    expect(ids.every((id) => !sourceIds.has(id))).toBe(true)
    expect(result.components).toBe(source.components)
    expect(source).toEqual(snapshot)
  })

  it('updates the existing binding and keeps its id and surviving field ids', () => {
    const existing = binding('stretch', ['topStretch', 'rightStretch'])
    const source = fixture({ stretch: existing })
    const snapshot = structuredClone(source)
    const result = setStretchBinding(createBaseOperationParams(source), {
      modelId: 'panel',
      fields: ['leftStretch', 'rightStretch'],
    })
    expect(Object.keys(result.bindings)).toEqual(['stretch'])
    expect(result.bindings.stretch.fields.map((field) => field.field)).toEqual(['rightStretch', 'leftStretch'])
    expect(result.bindings.stretch.fields[0]).toBe(existing.fields[1])
    expect(source).toEqual(snapshot)
  })

  it('orders all sides canonically and deduplicates the selection', () => {
    const source = fixture()
    const result = setStretchBinding(createBaseOperationParams(source), {
      modelId: 'panel',
      fields: ['leftStretch', 'bottomStretch', 'rightStretch', 'topStretch', 'leftStretch'],
    })
    expect(Object.values(result.bindings)[0].fields.map((field) => field.field)).toEqual(STRETCH_FIELD_ORDER)
  })

  it('deletes the internal binding for zero or one selected side', () => {
    const selections: (readonly (keyof HasStretchSchema)[])[] = [[], ['topStretch']]
    for (const fields of selections) {
      const source = fixture({ stretch: binding('stretch', STRETCH_FIELD_ORDER) })
      const snapshot = structuredClone(source)
      const result = setStretchBinding(createBaseOperationParams(source), { modelId: 'panel', fields })
      expect(result.bindings).toEqual({})
      expect(source).toEqual(snapshot)
    }
  })

  it('returns the original reference when an unchanged binding is saved', () => {
    const source = fixture({ stretch: binding('stretch', ['topStretch', 'leftStretch']) })
    expect(
      setStretchBinding(createBaseOperationParams(source), {
        modelId: 'panel',
        fields: ['leftStretch', 'topStretch'],
      }),
    ).toBe(source)
  })

  it('returns the original reference when fewer than two unbound sides are selected', () => {
    const source = fixture()
    const selections: (readonly (keyof HasStretchSchema)[])[] = [[], ['rightStretch']]
    for (const fields of selections) {
      expect(setStretchBinding(createBaseOperationParams(source), { modelId: 'panel', fields })).toBe(source)
    }
  })

  it('preserves external and unrelated bindings while creating and deleting an internal binding', () => {
    const external = binding('external', ['topStretch'])
    external.fields.push({
      id: 'root-width',
      type: 'root-panel-binding-field',
      modelId: 'root',
      field: 'width',
    })
    const unrelated: BindingSchema = {
      id: 'radius',
      type: 'equal-binding',
      fields: [
        { id: 'panel-top-left', type: 'panel-binding-field', modelId: 'panel', field: 'topLeftRadius' },
        { id: 'panel-top-right', type: 'panel-binding-field', modelId: 'panel', field: 'topRightRadius' },
      ],
    }
    const source = fixture({ external, radius: unrelated })
    const snapshot = structuredClone(source)
    const added = setStretchBinding(createBaseOperationParams(source), {
      modelId: 'panel',
      fields: ['rightStretch', 'leftStretch'],
    })
    expect(Object.values(added.bindings)).toHaveLength(3)
    expect(added.bindings.external).toBe(external)
    expect(added.bindings.radius).toBe(unrelated)
    const removed = setStretchBinding(createBaseOperationParams(added), { modelId: 'panel', fields: [] })
    expect(removed.bindings).toEqual(source.bindings)
    expect(removed.bindings.external).toBe(external)
    expect(source).toEqual(snapshot)
  })

  it('rejects selecting a side bound outside the component stretch group', () => {
    const external = binding('external', ['topStretch'])
    external.fields.push({
      id: 'panel-width',
      type: 'panel-binding-field',
      modelId: 'panel',
      field: 'width',
    })
    const source = fixture({ external, internal: binding('internal', ['leftStretch', 'rightStretch']) })
    const snapshot = structuredClone(source)
    expect(
      setStretchBinding(createBaseOperationParams(source), {
        modelId: 'panel',
        fields: ['topStretch', 'bottomStretch'],
      }),
    ).toBe(source)
    expect(source).toEqual(snapshot)
  })

  it('rejects changes when two separate internal bindings exist', () => {
    const source = fixture({
      vertical: binding('vertical', ['topStretch', 'bottomStretch']),
      horizontal: binding('horizontal', ['leftStretch', 'rightStretch']),
    })
    const snapshot = structuredClone(source)
    for (const fields of [[], STRETCH_FIELD_ORDER]) {
      expect(setStretchBinding(createBaseOperationParams(source), { modelId: 'panel', fields })).toBe(source)
    }
    expect(source).toEqual(snapshot)
  })

  it('creates pocket-cluster fields for pocket clusters', () => {
    const source = fixture()
    const result = setStretchBinding(createBaseOperationParams(source), {
      modelId: 'cluster',
      fields: ['rightStretch', 'leftStretch'],
    })
    expect(
      Object.values(result.bindings)[0].fields.every(
        (field) => field.modelId === 'cluster' && field.type === 'pocket-cluster-binding-field',
      ),
    ).toBe(true)
  })

  it('leaves value propagation and edits of non-first fields to the resolver', () => {
    const source = fixture()
    const updated = setStretchBinding(createBaseOperationParams(source), {
      modelId: 'panel',
      fields: ['leftStretch', 'topStretch'],
    })
    const resolved = applyResolution({
      input: source,
      target: updated,
      inputDiff: getSubProjectDiff(source, updated),
    })
    const panel = accessors.subProject(resolved).component.panel('panel')
    expect(panel.leftStretch).toBe(12)
    const edited: SubProjectSchema = {
      ...resolved,
      components: { ...resolved.components, panel: { ...panel, leftStretch: -3 } },
    }
    const propagated = applyResolution({
      input: resolved,
      target: edited,
      inputDiff: getSubProjectDiff(resolved, edited),
    })
    expect(accessors.subProject(propagated).component.panel('panel').topStretch).toBe(-3)
  })

  it.each(['missing', 'root'])('returns the original reference for unsupported model %s', (modelId) => {
    const source = fixture()
    expect(
      setStretchBinding(createBaseOperationParams(source), {
        modelId,
        fields: ['topStretch', 'rightStretch'],
      }),
    ).toBe(source)
  })
})
