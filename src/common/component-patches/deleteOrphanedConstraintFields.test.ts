import { describe, expect, it } from 'vitest'
import { defaultStitchingSettings } from '../defaultStates'
import { getComputedSubProject } from '../logic/getComputedSubProject'
import { deleteComponent } from '../operations/subProject/deleteComponent'
import { createPocketOpening } from '../operations/subProject/utils/createPocketOpening'
import type { ConstraintFieldSchema, ConstraintSchema } from '../schemas/constraints'
import { d } from '../testData'
import { deleteOrphanedConstraintFields } from './deleteOrphanedConstraintFields'
import { getPatchedSubProject } from './getPatchedSubProject'

const fields: ConstraintFieldSchema[] = [
  { id: 'root-field', type: 'root-panel-constraint-field', modelId: 'root', field: 'width' },
  { id: 'panel-field', type: 'panel-constraint-field', modelId: 'panel', field: 'width' },
  { id: 'cluster-field', type: 'pocket-cluster-constraint-field', modelId: 'cluster', field: 'width' },
  { id: 'front-field', type: 'front-pocket-constraint-field', modelId: 'front', field: 'topLeftRadius' },
  { id: 't-field', type: 't-pocket-constraint-field', modelId: 't', field: 'tPocketTabWidth' },
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
      createPocketOpening({ id: 'recessed', type: 'recessed', name: 'Recessed' }),
      createPocketOpening({ id: 'slanted', type: 'slanted', name: 'Slanted' }),
      createPocketOpening({ id: 'optical', type: 'optical-illusion', name: 'Optical' }),
    ],
    constraints: { linked: { id: 'linked', type: 'constraint', relation: 'equal', fields } },
  })

describe('deleteOrphanedConstraintFields', () => {
  it('keeps all supported model types and preserves references when unchanged', () => {
    const source = fixture()
    expect(deleteOrphanedConstraintFields(source, getComputedSubProject(source, defaultStitchingSettings))).toBe(source)
  })

  it.each(fields)('removes missing and wrong model types for $type', (field) => {
    const source = fixture()
    const constraint: ConstraintSchema = {
      ...source.constraints.linked,
      fields: [
        fields[0],
        fields[1],
        { ...field, modelId: 'missing' },
        { ...field, modelId: source.defaultPocketOpening },
        { ...field, modelId: field.type === 'root-panel-constraint-field' ? 'panel' : 'root' },
      ],
    }
    source.constraints = { ...source.constraints, changed: constraint }
    const snapshot = structuredClone(source)
    const computed = getComputedSubProject(source, defaultStitchingSettings)
    const result = deleteOrphanedConstraintFields(source, computed)
    expect(result.constraints.changed.fields).toEqual([fields[0], fields[1]])
    expect(result.constraints.linked).toBe(source.constraints.linked)
    expect(result.components).toBe(source.components)
    expect(result.holes).toBe(source.holes)
    expect(result.stitchLines).toBe(source.stitchLines)
    expect(deleteOrphanedConstraintFields(result, computed)).toBe(result)
    expect(source).toEqual(snapshot)
  })

  it.each([0, 1])('deletes a constraint with %s surviving members', (surviving) => {
    const source = fixture()
    source.constraints.linked = {
      ...source.constraints.linked,
      fields: [...fields.slice(0, surviving), { ...fields[0], modelId: 'missing' }],
    }
    expect(
      deleteOrphanedConstraintFields(source, getComputedSubProject(source, defaultStitchingSettings)).constraints,
    ).toEqual({})
  })

  it('cleans members after patchers remove holes and stitches belonging to a deleted component', () => {
    const source = fixture()
    const original = structuredClone(source)
    const deleted = deleteComponent(source, { componentId: 'panel' })
    const result = getPatchedSubProject(deleted, getComputedSubProject(deleted, defaultStitchingSettings))
    expect(result.holes).toEqual([])
    expect(result.stitchLines.map((stitchLine) => stitchLine.id)).not.toContain('bounds')
    expect(result.constraints.linked.fields.map((field) => field.modelId)).toEqual(
      fields.map((field) => field.modelId).filter((id) => !['panel', 'hole', 'bounds'].includes(id)),
    )
    expect(source).toEqual(original)
  })
})
