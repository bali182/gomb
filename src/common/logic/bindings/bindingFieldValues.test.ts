import { describe, expect, it } from 'vitest'
import type { BindingFieldSchema } from '../../schemas/bindings'
import { d } from '../../testData'
import { EN } from '../../translations/en'
import { accessors } from '../../utils/accessors'
import { NameGenerator } from '../../utils/factory/NameGenerator'
import { ReadonlyModelObjectFactory } from '../../utils/factory/ReadonlyModelObjectFactory'
import { IdGenerator } from '../../utils/random/IdGenerator'
import { getBindingFieldValue, setBindingFieldValue } from './bindingFieldValues'

const modelFactory = new ReadonlyModelObjectFactory(new IdGenerator(), new NameGenerator(EN.defaultNames))
const fields: BindingFieldSchema[] = [
  { id: 'root-field', type: 'root-panel-binding-field', modelId: 'root', field: 'width' },
  { id: 'panel-field', type: 'panel-binding-field', modelId: 'panel', field: 'height' },
  { id: 'cluster-field', type: 'pocket-cluster-binding-field', modelId: 'cluster', field: 'width' },
  { id: 'front-field', type: 'front-pocket-binding-field', modelId: 'front', field: 'topLeftRadius' },
  { id: 'pocket-field', type: 't-pocket-binding-field', modelId: 'pocket', field: 'tPocketTabWidth' },
  { id: 'hole-field', type: 'hole-binding-field', modelId: 'hole', field: 'width' },
  {
    id: 'bounds-field',
    type: 'component-bounds-stitch-line-binding-field',
    modelId: 'bounds',
    field: 'topLeftRadius',
  },
  { id: 'stitch-field', type: 't-pocket-stitch-line-binding-field', modelId: 'stitch', field: 'startOffset' },
  { id: 'recessed-field', type: 'recessed-binding-field', modelId: 'recessed', field: 'recessDepth' },
  { id: 'recessed-start-margin', type: 'recessed-binding-field', modelId: 'recessed', field: 'recessStartMargin' },
  { id: 'recessed-end-margin', type: 'recessed-binding-field', modelId: 'recessed', field: 'recessEndMargin' },
  { id: 'slanted-field', type: 'slanted-binding-field', modelId: 'slanted', field: 'slantOffset' },
  { id: 'optical-field', type: 'optical-illusion-binding-field', modelId: 'optical', field: 'illusionStartInset' },
]
const fixture = () =>
  d.subProject({
    frontFace: d.rootPanelFace({ id: 'root-front', children: ['panel', 'cluster'] }),
    id: 'sub',
    root: d.rootPanel({ id: 'root', width: 10 }),
    components: [
      d.panel({ id: 'panel', height: 10 }),
      d.pocketCluster({ id: 'cluster', width: 10, children: ['front', 'pocket'] }),
      d.frontPocket({ id: 'front', topLeftRadius: 10 }),
      d.tPocket({ id: 'pocket', tPocketTabWidth: 10 }),
    ],
    holes: [d.hole({ id: 'hole', componentId: 'panel', width: 10 })],
    stitchLines: [
      d.componentBoundsStitchLine({ id: 'bounds', targetId: 'panel', targetType: 'component', topLeftRadius: 10 }),
      d.tPocketStitchLine({ id: 'stitch', targetId: 'pocket', targetType: 'component', startOffset: 10 }),
    ],
    pocketOpenings: [
      {
        ...modelFactory.createRecessedPocketOpening({}),
        id: 'recessed',
        recessDepth: 10,
        recessStartMargin: 10,
        recessEndMargin: 10,
      },
      { ...modelFactory.createSlantedPocketOpening({}), id: 'slanted', slantOffset: 10 },
      { ...modelFactory.createOpticalIllusionPocketOpening({}), id: 'optical', illusionStartInset: 10 },
    ],
  })

describe('binding field values', () => {
  it.each(fields)('reads and updates $type without changing other fields or the source', (bindingField) => {
    const before = fixture()
    const snapshot = structuredClone(before)
    expect(getBindingFieldValue(accessors.subProject(before).binding.model(bindingField), bindingField)).toBe(10)
    const result = setBindingFieldValue(before, bindingField, 35)
    expect(getBindingFieldValue(accessors.subProject(result).binding.model(bindingField), bindingField)).toBe(35)
    expect(before).toEqual(snapshot)
    for (const other of fields) {
      if (other !== bindingField) {
        expect(getBindingFieldValue(accessors.subProject(result).binding.model(other), other)).toBe(10)
      }
    }
    expect(setBindingFieldValue(result, bindingField, 35)).toBe(result)
  })

  it('rejects incompatible primitive values and enum values before changing a model', () => {
    const input = fixture()
    expect(() => setBindingFieldValue(input, fields[0], 'invalid')).toThrow('Incompatible binding value')
    expect(() => setBindingFieldValue(input, fields[0], undefined)).toThrow('Incompatible binding value')
    expect(() =>
      setBindingFieldValue(
        input,
        { id: 'anchor', type: 'panel-binding-field', modelId: 'panel', field: 'mainAxisAnchor' },
        'portrait',
      ),
    ).toThrow('Incompatible binding value')
    expect(getBindingFieldValue(accessors.subProject(input).binding.model(fields[0]), fields[0])).toBe(10)
  })
})
