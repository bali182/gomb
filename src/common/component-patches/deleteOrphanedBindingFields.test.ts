import { describe, expect, it } from 'vitest'
import { defaultStitchingSettings } from '../defaultStates'
import { getComputedSubProject } from '../logic/getComputedSubProject'
import { deleteComponent } from '../operations/subProject/deleteComponent'
import { createBaseOperationParams } from '../operations/subProject/testUtils'
import type { BindingFieldSchema, BindingSchema } from '../schemas/bindings'
import { d } from '../testData'
import { EN } from '../translations/en'
import { NameGenerator } from '../utils/factory/NameGenerator'
import { ReadonlyModelObjectFactory } from '../utils/factory/ReadonlyModelObjectFactory'
import { IdGenerator } from '../utils/random/IdGenerator'
import { deleteOrphanedBindingFields } from './deleteOrphanedBindingFields'
import { getPatchedSubProject } from './getPatchedSubProject'

const modelFactory = new ReadonlyModelObjectFactory(new IdGenerator(), new NameGenerator(EN.defaultNames))

const fields: BindingFieldSchema[] = [
  { id: 'root-field', type: 'root-panel-binding-field', modelId: 'root', field: 'width' },
  { id: 'panel-field', type: 'panel-binding-field', modelId: 'panel', field: 'width' },
  { id: 'cluster-field', type: 'pocket-cluster-binding-field', modelId: 'cluster', field: 'width' },
  { id: 'front-field', type: 'front-pocket-binding-field', modelId: 'front', field: 'topLeftRadius' },
  { id: 't-field', type: 't-pocket-binding-field', modelId: 't', field: 'tPocketTabWidth' },
  { id: 'hole-field', type: 'hole-binding-field', modelId: 'hole', field: 'width' },
  {
    id: 'bounds-field',
    type: 'component-bounds-stitch-line-binding-field',
    modelId: 'bounds',
    field: 'topLeftRadius',
  },
  { id: 'stitch-field', type: 't-pocket-stitch-line-binding-field', modelId: 'stitch', field: 'startOffset' },
  { id: 'recessed-field', type: 'recessed-binding-field', modelId: 'recessed', field: 'recessDepth' },
  { id: 'slanted-field', type: 'slanted-binding-field', modelId: 'slanted', field: 'slantOffset' },
  { id: 'optical-field', type: 'optical-illusion-binding-field', modelId: 'optical', field: 'illusionStartInset' },
]
const fixture = () =>
  d.subProject({
    id: 'sub',
    root: d.rootPanel({ id: 'root', children: ['panel', 'cluster'] }),
    components: [
      d.panel({ id: 'panel' }),
      d.pocketCluster({ id: 'cluster', children: ['t', 'front'] }),
      d.tPocket({ id: 't' }),
      d.frontPocket({ id: 'front' }),
    ],
    holes: [d.hole({ id: 'hole', componentId: 'panel' })],
    stitchLines: [
      d.componentBoundsStitchLine({ id: 'bounds', targetId: 'hole', targetType: 'hole' }),
      d.tPocketStitchLine({ id: 'stitch', targetId: 't', targetType: 'component' }),
    ],
    pocketOpenings: [
      { ...modelFactory.createPocketOpening({ type: 'recessed' }), id: 'recessed', name: 'Recessed' },
      { ...modelFactory.createPocketOpening({ type: 'slanted' }), id: 'slanted', name: 'Slanted' },
      { ...modelFactory.createPocketOpening({ type: 'optical-illusion' }), id: 'optical', name: 'Optical' },
    ],
    bindings: { linked: { id: 'linked', type: 'equal-binding', fields } },
  })

describe('deleteOrphanedBindingFields', () => {
  it('keeps all supported model types and preserves references when unchanged', () => {
    const source = fixture()
    expect(deleteOrphanedBindingFields(source, getComputedSubProject(source, defaultStitchingSettings))).toBe(source)
  })

  it.each(fields)('removes missing and wrong model types for $type', (field) => {
    const source = fixture()
    const binding: BindingSchema = {
      ...source.bindings.linked,
      fields: [
        fields[0],
        fields[1],
        { ...field, modelId: 'missing' },
        { ...field, modelId: source.defaultPocketOpening },
        { ...field, modelId: field.type === 'root-panel-binding-field' ? 'panel' : 'root' },
      ],
    }
    source.bindings = { ...source.bindings, changed: binding }
    const snapshot = structuredClone(source)
    const computed = getComputedSubProject(source, defaultStitchingSettings)
    const result = deleteOrphanedBindingFields(source, computed)
    expect(result.bindings.changed.fields).toEqual([fields[0], fields[1]])
    expect(result.bindings.linked).toBe(source.bindings.linked)
    expect(result.components).toBe(source.components)
    expect(result.holes).toBe(source.holes)
    expect(result.stitchLines).toBe(source.stitchLines)
    expect(deleteOrphanedBindingFields(result, computed)).toBe(result)
    expect(source).toEqual(snapshot)
  })

  it.each([0, 1])('preserves a binding with %s surviving members after cleanup', (surviving) => {
    const source = fixture()
    source.bindings.linked = {
      ...source.bindings.linked,
      fields: [...fields.slice(0, surviving), { ...fields[0], modelId: 'missing' }],
    }
    const snapshot = structuredClone(source)
    const computed = getComputedSubProject(source, defaultStitchingSettings)
    const result = deleteOrphanedBindingFields(source, computed)
    expect(result.bindings.linked).toEqual({
      ...source.bindings.linked,
      fields: fields.slice(0, surviving),
    })
    expect(Object.keys(result.bindings)).toEqual(['linked'])
    expect(deleteOrphanedBindingFields(result, computed)).toBe(result)
    expect(source).toEqual(snapshot)
  })

  it.each([0, 1])('preserves references for a valid binding with %s members', (count) => {
    const source = fixture()
    source.bindings.linked = { ...source.bindings.linked, fields: fields.slice(0, count) }
    expect(deleteOrphanedBindingFields(source, getComputedSubProject(source, defaultStitchingSettings))).toBe(source)
  })

  it('preserves an empty binding through the complete patcher chain', () => {
    const source = fixture()
    source.bindings.linked = { ...source.bindings.linked, fields: [] }
    const result = getPatchedSubProject(source, getComputedSubProject(source, defaultStitchingSettings))
    expect(result.bindings).toBe(source.bindings)
    expect(result.bindings.linked.fields).toEqual([])
  })

  it('cleans members after patchers remove holes and stitches belonging to a deleted component', () => {
    const source = fixture()
    const original = structuredClone(source)
    const deleted = deleteComponent(createBaseOperationParams(source), { id: 'panel' })
    const result = getPatchedSubProject(deleted, getComputedSubProject(deleted, defaultStitchingSettings))
    expect(result.holes).toEqual([])
    expect(result.stitchLines.map((stitchLine) => stitchLine.id)).not.toContain('bounds')
    expect(result.bindings.linked.fields.map((field) => field.modelId)).toEqual(
      fields.map((field) => field.modelId).filter((id) => !['panel', 'hole', 'bounds'].includes(id)),
    )
    expect(source).toEqual(original)
  })
})

describe('obsolete binding fields', () => {
  it('removes fields absent from the current model schema', () => {
    const source = fixture()
    const obsolete = {
      id: 'obsolete',
      type: 'component-bounds-stitch-line-binding-field',
      modelId: 'bounds',
      field: 'topStartOffset',
    } as unknown as BindingFieldSchema
    source.bindings.linked = { ...source.bindings.linked, fields: [fields[0], obsolete] }
    const computed = getComputedSubProject(source, defaultStitchingSettings)
    const result = deleteOrphanedBindingFields(source, computed)
    expect(result.bindings.linked.fields).toEqual([fields[0]])
    expect(source.bindings.linked.fields).toHaveLength(2)
  })
})
