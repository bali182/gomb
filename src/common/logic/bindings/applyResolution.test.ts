import { describe, expect, it } from 'vitest'
import { createBaseOperationParams } from '../../operations/subProject/testUtils'
import { updateComponent } from '../../operations/subProject/updateComponent'
import { updateStitchLine } from '../../operations/subProject/updateStitchLine'
import type { BindingFieldSchema, EqualBindingSchema, PanelBindingFieldSchema } from '../../schemas/bindings'
import type { SubProjectSchema } from '../../schemas/subProject'
import { d } from '../../testData'
import { accessors } from '../../utils/accessors'
import { getSubProjectDiff } from '../../utils/getSubProjectDiff'
import { applyResolution } from './applyResolution'
import { getBindingFieldValue } from './bindingFieldValues'

const field = (
  modelId: string,
  name: PanelBindingFieldSchema['field'] = 'width',
  id = `${modelId}:${name}`,
): PanelBindingFieldSchema => ({
  id,
  type: 'panel-binding-field',
  modelId,
  field: name,
})
const equal = (id: string, fields: BindingFieldSchema[]): EqualBindingSchema => ({
  id,
  type: 'equal-binding',
  fields,
})
const fixture = (bindings: Record<string, EqualBindingSchema>): SubProjectSchema =>
  d.subProject({
    frontFace: d.rootPanelFace({ id: 'root-front', children: ['a', 'b', 'c', 'd'] }),
    id: 'sub',
    root: d.rootPanel({ id: 'root' }),
    components: ['a', 'b', 'c', 'd'].map((id) =>
      d.panel({ id, width: 10, height: 10, autoWidth: false, autoHeight: false }),
    ),
    stitchLines: [
      d.componentBoundsStitchLine({ id: 's1', targetId: 'a', targetType: 'component', stitchMargin: 5 }),
      d.componentBoundsStitchLine({ id: 's2', targetId: 'b', targetType: 'component', stitchMargin: 5 }),
    ],
    bindings,
  })
const setWidth = (subProject: SubProjectSchema, id: string, width: number): SubProjectSchema =>
  updateComponent(createBaseOperationParams(subProject), {
    component: { ...accessors.subProject(subProject).component.panel(id), width },
  })
const resolveEdit = (before: SubProjectSchema, after: SubProjectSchema): SubProjectSchema =>
  applyResolution({ input: after, target: after, inputDiff: getSubProjectDiff(before, after) })

describe('applyResolution before patching', () => {
  it('propagates the edited field to every field of its binding', () => {
    const before = fixture({
      linked: equal('linked', [field('a'), field('b', 'height'), field('c')]),
    })
    const snapshot = structuredClone(before)
    const input = setWidth(before, 'c', 42)
    const result = resolveEdit(before, input)
    expect(accessors.subProject(result).component.panel('a').width).toBe(42)
    expect(accessors.subProject(result).component.panel('b').height).toBe(42)
    expect(accessors.subProject(result).component.panel('c').width).toBe(42)
    expect(result.components.d).toBe(before.components.d)
    expect(before).toEqual(snapshot)
    expect(accessors.subProject(input).component.panel('a').width).toBe(10)
  })

  it('propagates multiple equal writes, but resolves conflicting writes from the first current field', () => {
    const before = fixture({ linked: equal('linked', [field('a'), field('a', 'height'), field('b')]) })
    const panel = accessors.subProject(before).component.panel('a')
    const identical = updateComponent(createBaseOperationParams(before), {
      component: { ...panel, width: 20, height: 20 },
    })
    const different = updateComponent(createBaseOperationParams(before), {
      component: { ...panel, width: 20, height: 30 },
    })
    expect(accessors.subProject(resolveEdit(before, identical)).component.panel('b').width).toBe(20)
    const result = resolveEdit(before, different)
    expect(accessors.subProject(result).component.panel('a').height).toBe(20)
    expect(accessors.subProject(result).component.panel('b').width).toBe(20)
  })

  it('resolves independent bindings separately within one edit', () => {
    const before = fixture({
      widths: equal('widths', [field('a'), field('b')]),
      heights: equal('heights', [field('a', 'height'), field('c', 'height')]),
    })
    const input = updateComponent(createBaseOperationParams(setWidth(before, 'b', 30)), {
      component: { ...accessors.subProject(before).component.panel('c'), height: 40 },
    })
    const panel = accessors.subProject(resolveEdit(before, input)).component.panel('a')
    expect(panel.width).toBe(30)
    expect(panel.height).toBe(40)
  })

  it('uses the existing binding value when an unbound field is added', () => {
    const source = fixture({
      receiving: equal('receiving', [field('b'), field('c')]),
    })
    const before = setWidth(setWidth(source, 'b', 25), 'c', 25)
    const after = {
      ...before,
      bindings: {
        ...before.bindings,
        receiving: equal('receiving', [field('a', 'width', 'added-a'), field('b'), field('c')]),
      },
    }
    const result = resolveEdit(before, after)
    for (const id of ['a', 'b', 'c']) {
      expect(accessors.subProject(result).component.panel(id).width).toBe(25)
    }
  })

  it('does not propagate edits after a binding or field is removed', () => {
    const before = fixture({ ab: equal('ab', [field('a'), field('b')]), cd: equal('cd', [field('c'), field('d')]) })
    const input = { ...setWidth(before, 'a', 35), bindings: { cd: before.bindings.cd } }
    const result = resolveEdit(before, input)
    expect(accessors.subProject(result).component.panel('a').width).toBe(35)
    expect(accessors.subProject(result).component.panel('b').width).toBe(10)
    expect(accessors.subProject(result).component.panel('c').width).toBe(10)
    const removedMember = {
      ...setWidth(before, 'a', 35),
      bindings: { ...before.bindings, ab: equal('ab', [field('b')]) },
    }
    expect(accessors.subProject(resolveEdit(before, removedMember)).component.panel('b').width).toBe(10)
  })

  it('keeps empty and single-field bindings and uses the first field on loading', () => {
    const source = fixture({
      empty: equal('empty', []),
      single: equal('single', [field('d')]),
      linked: equal('linked', [field('b'), field('a')]),
    })
    const input = setWidth(source, 'b', 25)
    const result = applyResolution({ input, target: input, inputDiff: getSubProjectDiff(undefined, input) })
    expect(accessors.subProject(result).component.panel('a').width).toBe(25)
    expect(result.bindings).toBe(input.bindings)
  })

  it('returns an unbound subproject unchanged', () => {
    const before = fixture({})
    const input = setWidth(before, 'a', 25)
    expect(resolveEdit(before, input)).toBe(input)
  })

  it('does not treat a model subtype change as a field edit when adding a binding', () => {
    const source = fixture({ linked: equal('linked', [field('a')]) })
    const before = updateComponent(createBaseOperationParams(setWidth(source, 'a', 25)), {
      component: d.frontPocket({ id: 'b' }),
    })
    const edited = updateComponent(createBaseOperationParams(before), { component: d.panel({ id: 'b', width: 99 }) })
    const input: SubProjectSchema = {
      ...edited,
      bindings: { linked: equal('linked', [field('b'), field('a')]) },
    }
    const result = resolveEdit(before, input)
    expect(accessors.subProject(result).component.panel('a').width).toBe(25)
    expect(accessors.subProject(result).component.panel('b').width).toBe(25)
  })

  it('ignores orphaned members without restoring deleted models', () => {
    const before = fixture({ linked: equal('linked', [field('a'), field('b')]) })
    const components = { ...before.components }
    delete components.a
    const input = { ...before, components }
    expect(resolveEdit(before, input)).toBe(input)
    expect(input.components).not.toHaveProperty('a')
  })

  it('uses a surviving existing field when another model is deleted while a field is added', () => {
    const source = fixture({ linked: equal('linked', [field('a'), field('b')]) })
    const before = setWidth(setWidth(source, 'a', 25), 'b', 25)
    const components = { ...before.components }
    delete components.a
    const input: SubProjectSchema = {
      ...before,
      components,
      bindings: { linked: equal('linked', [field('c'), field('a'), field('b')]) },
    }
    const result = resolveEdit(before, input)
    expect(accessors.subProject(result).component.panel('b').width).toBe(25)
    expect(accessors.subProject(result).component.panel('c').width).toBe(25)
    expect(result.components).not.toHaveProperty('a')
  })

  it('returns the same subproject when only unrelated fields change or models are cloned', () => {
    const before = fixture({ linked: equal('linked', [field('a'), field('b')]) })
    const input = updateComponent(createBaseOperationParams(before), {
      component: { ...accessors.subProject(before).component.panel('b'), name: 'Renamed' },
    })
    expect(resolveEdit(before, input)).toBe(input)
    const cloned = updateComponent(createBaseOperationParams(input), {
      component: { ...accessors.subProject(input).component.panel('a'), id: 'copy' },
    })
    expect(resolveEdit(input, cloned)).toBe(cloned)
  })

  it('propagates optional resets as deletions and treats missing and undefined equally', () => {
    const fields: BindingFieldSchema[] = [
      { id: 's1-margin', type: 'component-bounds-stitch-line-binding-field', modelId: 's1', field: 'stitchMargin' },
      { id: 's2-margin', type: 'component-bounds-stitch-line-binding-field', modelId: 's2', field: 'stitchMargin' },
    ]
    const before = fixture({ linked: equal('linked', fields) })
    const stitchLine = { ...accessors.subProject(before).stitchLine.bounds('s2') }
    delete stitchLine.stitchMargin
    const input = updateStitchLine(createBaseOperationParams(before), { stitchLine })
    const result = resolveEdit(before, input)
    expect(accessors.subProject(result).stitchLine.bounds('s1')).not.toHaveProperty('stitchMargin')
    expect(getBindingFieldValue(accessors.subProject(result).binding.model(fields[1]), fields[1])).toBeUndefined()
    const explicit = updateStitchLine(createBaseOperationParams(result), {
      stitchLine: { ...stitchLine, stitchMargin: undefined },
    })
    expect(resolveEdit(result, explicit)).toBe(explicit)
  })

  it('propagates enums across compatible field names', () => {
    const before = fixture({ linked: equal('linked', [field('a', 'mainAxisAnchor'), field('b', 'offAxisAnchor')]) })
    const input = updateComponent(createBaseOperationParams(before), {
      component: { ...accessors.subProject(before).component.panel('b'), offAxisAnchor: 'end' },
    })
    const result = resolveEdit(before, input)
    expect(accessors.subProject(result).component.panel('a').mainAxisAnchor).toBe('end')
  })

  it('clears linked item references while retaining each pocket orientation and offsets', () => {
    const before = d.subProject({
      frontFace: d.rootPanelFace({ id: 'root-front', children: ['cluster'] }),
      id: 'sub',
      root: d.rootPanel({ id: 'root' }),
      components: [
        d.pocketCluster({ id: 'cluster', children: ['a', 'b'] }),
        d.tPocket({
          id: 'a',
          itemId: 'ID-1',
          itemOrientation: 'portrait',
          itemCrossAxisOffset: 5,
          itemOpeningOffset: 7,
        }),
        d.tPocket({
          id: 'b',
          itemId: 'ID-1',
          itemOrientation: 'portrait',
          itemCrossAxisOffset: 11,
          itemOpeningOffset: 13,
        }),
      ],
      bindings: {
        linked: equal('linked', [
          { id: 'a-item', type: 't-pocket-binding-field', modelId: 'a', field: 'itemId' },
          { id: 'b-item', type: 't-pocket-binding-field', modelId: 'b', field: 'itemId' },
        ]),
      },
    })
    const input = updateComponent(createBaseOperationParams(before), {
      component: { ...accessors.subProject(before).component.tPocket('a'), itemId: undefined },
    })
    const result = resolveEdit(before, input)
    expect(accessors.subProject(result).component.tPocket('a')).toMatchObject({
      itemOrientation: 'portrait',
      itemCrossAxisOffset: 5,
      itemOpeningOffset: 7,
    })
    expect(accessors.subProject(result).component.tPocket('b')).toMatchObject({
      itemOrientation: 'portrait',
      itemCrossAxisOffset: 11,
      itemOpeningOffset: 13,
    })
    expect(accessors.subProject(result).component.tPocket('b')).not.toHaveProperty('itemId')
  })
})

describe('applyResolution after patching', () => {
  it('uses the original input diff after both resolution and patching changed the inputs', () => {
    const before = fixture({ linked: equal('linked', [field('a'), field('b'), field('c')]) })
    const edited = setWidth(before, 'b', 40)
    const inputDiff = getSubProjectDiff(before, edited)
    const input = applyResolution({ input: edited, target: edited, inputDiff })
    const patched = setWidth(setWidth(setWidth(input, 'a', 15), 'b', 20), 'c', 25)
    const snapshot = structuredClone(inputDiff)
    const result = applyResolution({ input, target: patched, inputDiff, patchDiff: getSubProjectDiff(input, patched) })
    for (const id of ['a', 'b', 'c']) {
      expect(accessors.subProject(result).component.panel(id).width).toBe(40)
    }
    expect(inputDiff).toEqual(snapshot)
    expect(accessors.subProject(edited).component.panel('a').width).toBe(10)
    expect(accessors.subProject(patched).component.panel('b').width).toBe(20)
  })

  it('preserves an optional reset from the input diff when a patcher writes a value back', () => {
    const fields: BindingFieldSchema[] = [
      { id: 's1-margin', type: 'component-bounds-stitch-line-binding-field', modelId: 's1', field: 'stitchMargin' },
      { id: 's2-margin', type: 'component-bounds-stitch-line-binding-field', modelId: 's2', field: 'stitchMargin' },
    ]
    const before = fixture({ linked: equal('linked', fields) })
    const stitchLine = { ...accessors.subProject(before).stitchLine.bounds('s2') }
    delete stitchLine.stitchMargin
    const edited = updateStitchLine(createBaseOperationParams(before), { stitchLine })
    const inputDiff = getSubProjectDiff(before, edited)
    const input = applyResolution({ input: edited, target: edited, inputDiff })
    const patched = updateStitchLine(createBaseOperationParams(input), {
      stitchLine: { ...accessors.subProject(input).stitchLine.bounds('s2'), stitchMargin: 15 },
    })
    const result = applyResolution({ input, target: patched, inputDiff, patchDiff: getSubProjectDiff(input, patched) })
    expect(accessors.subProject(result).stitchLine.bounds('s1')).not.toHaveProperty('stitchMargin')
    expect(accessors.subProject(result).stitchLine.bounds('s2')).not.toHaveProperty('stitchMargin')
  })

  it('propagates actual patcher changes when the binding has no input edit', () => {
    const input = fixture({ linked: equal('linked', [field('a'), field('b')]) })
    const patched = setWidth(input, 'b', 30)
    const result = applyResolution({
      input,
      target: patched,
      inputDiff: getSubProjectDiff(input, input),
      patchDiff: getSubProjectDiff(input, patched),
    })
    expect(accessors.subProject(result).component.panel('a').width).toBe(30)
  })

  it.each(['a', 'b'])('preserves the edited value when a patcher overwrites %s', (id) => {
    const before = fixture({ linked: equal('linked', [field('a'), field('b')]) })
    const inputDiff = getSubProjectDiff(before, setWidth(before, 'b', 40))
    const edited = setWidth(before, 'b', 40)
    const input = applyResolution({ input: edited, target: edited, inputDiff })
    const patched = setWidth(input, id, 0)
    const result = applyResolution({ input, target: patched, inputDiff, patchDiff: getSubProjectDiff(input, patched) })
    expect(accessors.subProject(result).component.panel('a').width).toBe(40)
    expect(accessors.subProject(result).component.panel('b').width).toBe(40)
  })

  it('resolves a patched binding independently of the manually edited binding', () => {
    const before = fixture({ ab: equal('ab', [field('a'), field('b')]), cd: equal('cd', [field('c'), field('d')]) })
    const inputDiff = getSubProjectDiff(before, setWidth(before, 'b', 40))
    const edited = setWidth(before, 'b', 40)
    const input = applyResolution({ input: edited, target: edited, inputDiff })
    const patched = setWidth(input, 'd', 55)
    const result = applyResolution({ input, target: patched, inputDiff, patchDiff: getSubProjectDiff(input, patched) })
    expect(accessors.subProject(result).component.panel('a').width).toBe(40)
    expect(accessors.subProject(result).component.panel('c').width).toBe(55)
  })

  it('uses the first patched field when patchers produce conflicting values', () => {
    const input = fixture({ linked: equal('linked', [field('a'), field('b'), field('c')]) })
    const patched = setWidth(setWidth(input, 'a', 20), 'b', 30)
    const result = applyResolution({
      input,
      target: patched,
      inputDiff: getSubProjectDiff(input, input),
      patchDiff: getSubProjectDiff(input, patched),
    })
    expect(accessors.subProject(result).component.panel('c').width).toBe(20)
  })
})
