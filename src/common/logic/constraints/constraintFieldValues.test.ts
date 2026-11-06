import { describe, expect, it } from 'vitest'
import type { ConstraintFieldSchema } from '../../schemas/constraints'
import { d } from '../../testData'
import { EN } from '../../translations/en'
import { accessors } from '../../utils/accessors'
import { NameGenerator } from '../../utils/factory/NameGenerator'
import { ReadonlyModelObjectFactory } from '../../utils/factory/ReadonlyModelObjectFactory'
import { IdGenerator } from '../../utils/random/IdGenerator'
import { getConstraintFieldValue, setConstraintFieldValue } from './constraintFieldValues'

const modelFactory = new ReadonlyModelObjectFactory(new IdGenerator(), new NameGenerator(EN.defaultNames))
const fields: ConstraintFieldSchema[] = [
  { id: 'root-field', type: 'root-panel-constraint-field', modelId: 'root', field: 'width' },
  { id: 'panel-field', type: 'panel-constraint-field', modelId: 'panel', field: 'height' },
  { id: 'cluster-field', type: 'pocket-cluster-constraint-field', modelId: 'cluster', field: 'width' },
  { id: 'front-field', type: 'front-pocket-constraint-field', modelId: 'front', field: 'topLeftRadius' },
  { id: 'pocket-field', type: 't-pocket-constraint-field', modelId: 'pocket', field: 'tPocketTabWidth' },
  { id: 'hole-field', type: 'hole-constraint-field', modelId: 'hole', field: 'width' },
  {
    id: 'bounds-field',
    type: 'component-bounds-stitch-line-constraint-field',
    modelId: 'bounds',
    field: 'topLeftRadius',
  },
  { id: 'stitch-field', type: 't-pocket-stitch-line-constraint-field', modelId: 'stitch', field: 'startOffset' },
  { id: 'recessed-field', type: 'recessed-constraint-field', modelId: 'recessed', field: 'depth' },
  { id: 'slanted-field', type: 'slanted-constraint-field', modelId: 'slanted', field: 'offset' },
  { id: 'optical-field', type: 'optical-illusion-constraint-field', modelId: 'optical', field: 'startInset' },
]
const fixture = () =>
  d.subProject({
    id: 'sub',
    root: d.rootPanel({ id: 'root', width: 10, children: ['panel', 'cluster'] }),
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
      { ...modelFactory.createRecessedPocketOpening({}), id: 'recessed', depth: 10 },
      { ...modelFactory.createSlantedPocketOpening({}), id: 'slanted', offset: 10 },
      { ...modelFactory.createOpticalIllusionPocketOpening({}), id: 'optical', startInset: 10 },
    ],
  })

describe('constraint field values', () => {
  it.each(fields)('reads and updates $type without changing other fields or the source', (constraintField) => {
    const before = fixture()
    const snapshot = structuredClone(before)
    expect(
      getConstraintFieldValue(accessors.subProject(before).constraint.model(constraintField), constraintField),
    ).toBe(10)
    const result = setConstraintFieldValue(before, constraintField, 35)
    expect(
      getConstraintFieldValue(accessors.subProject(result).constraint.model(constraintField), constraintField),
    ).toBe(35)
    expect(before).toEqual(snapshot)
    for (const other of fields) {
      if (other !== constraintField) {
        expect(getConstraintFieldValue(accessors.subProject(result).constraint.model(other), other)).toBe(10)
      }
    }
    expect(setConstraintFieldValue(result, constraintField, 35)).toBe(result)
  })

  it('rejects incompatible primitive values and enum values before changing a model', () => {
    const input = fixture()
    expect(() => setConstraintFieldValue(input, fields[0], 'invalid')).toThrow('Incompatible constraint value')
    expect(() => setConstraintFieldValue(input, fields[0], undefined)).toThrow('Incompatible constraint value')
    expect(() =>
      setConstraintFieldValue(
        input,
        { id: 'anchor', type: 'panel-constraint-field', modelId: 'panel', field: 'mainAxisAnchor' },
        'portrait',
      ),
    ).toThrow('Incompatible constraint value')
    expect(getConstraintFieldValue(accessors.subProject(input).constraint.model(fields[0]), fields[0])).toBe(10)
  })
})
