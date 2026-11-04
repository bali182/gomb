import { describe, expect, it } from 'vitest'
import { createPocketOpening } from '../operations/subProject/utils/createPocketOpening'
import type { ConstraintSchema } from '../schemas/constraints'
import type { ModelObjectSchema } from '../schemas/modelObject'
import type { PocketOpeningSchema } from '../schemas/pocketOpening'
import { d } from '../testData'
import { getSelectionOpacities } from './getSelectionOpacities'

const fixture = () => d.subProject({
  id: 'sub',
  root: d.rootPanel({ id: 'root', children: ['panel', 'cluster'] }),
  components: [d.panel({ id: 'panel' }), d.pocketCluster({ id: 'cluster', children: ['t', 'front'] }), d.tPocket({ id: 't', openingId: 'opening' }), d.frontPocket({ id: 'front', openingId: 'opening' })],
  holes: [d.hole({ id: 'hole', componentId: 'panel' })],
  stitchLines: [
    d.componentBoundsStitchLine({ id: 'bounds', targetId: 'panel', targetType: 'component' }),
    d.componentBoundsStitchLine({ id: 'hole-bounds', targetId: 'hole', targetType: 'hole' }),
    d.componentBoundsStitchLine({ id: 'on-top', targetId: 'panel', targetType: 'component', onTop: 'root' }),
    d.tPocketStitchLine({ id: 'pocket-stitch', targetId: 't', targetType: 'component' }),
  ],
})

type SelectionCase = { selected: ModelObjectSchema; related: string[] }

describe('getSelectionOpacities', () => {
  it.each([false, true])('does not dim the drawing when selecting a constraint, editing pocket contents: %s', (isEditingPocketContents) => {
    const source = fixture()
    const snapshot = structuredClone(source)
    const constraint: ConstraintSchema = {
      id: 'constraint', type: 'constraint', relation: 'equal', fields: [
        { id: 'first', type: 'panel-constraint-field', modelId: 'panel', field: 'width' },
        { id: 'second', type: 't-pocket-constraint-field', modelId: 't', field: 'tPocketTabWidth' },
      ],
    }
    const baseline = getSelectionOpacities(undefined, source, isEditingPocketContents)
    expect(getSelectionOpacities(constraint, source, isEditingPocketContents)).toEqual(baseline)
    expect(getSelectionOpacities({ ...constraint, fields: [] }, source, isEditingPocketContents)).toEqual(baseline)
    expect(source).toEqual(snapshot)
  })

  const source = fixture()
  const cases: SelectionCase[] = [
    ...Object.values(source.components).map((selected): SelectionCase => ({ selected, related: selected.type === 'pocket-cluster' ? ['cluster', 't', 'front'] : [selected.id] })),
    { selected: source.holes[0], related: ['panel'] },
    { selected: source.stitchLines[0], related: ['panel'] },
    { selected: source.stitchLines[1], related: ['panel'] },
    { selected: source.stitchLines[2], related: ['root'] },
    { selected: source.stitchLines[3], related: ['t'] },
  ]
  it.each(cases)('retains related components for $selected.type / $selected.id', ({ selected, related }) => {
    const result = getSelectionOpacities(selected, source, false)
    const activeComponents = Object.entries(result.components).filter(([, opacity]) => opacity.fill === 1).map(([id]) => id)
    expect(activeComponents).toEqual(Object.keys(source.components).filter((id) => related.includes(id)))
  })

  const openingTypes: PocketOpeningSchema['type'][] = ['straight', 'recessed', 'slanted', 'optical-illusion']
  it.each(openingTypes)('retains pocket highlighting for %s openings', (type) => {
    const source = fixture()
    const opening = createPocketOpening({ id: 'opening', name: 'Opening', type })
    const result = getSelectionOpacities(opening, source, false)
    expect(result.components.t.fill).toBe(1)
    expect(result.components.front.fill).toBe(1)
    expect(result.components.panel.fill).toBe(0)
    expect(result.pocketItems.t.fill).toBe(1)
    expect(result.pocketItems.front.fill).toBe(1)
    expect(getSelectionOpacities({ ...opening, id: 'unused' }, source, false)).toEqual(getSelectionOpacities(undefined, source, false))
  })

  it('keeps only the selected stitch line highlighted', () => {
    const source = fixture()
    const selected = source.stitchLines[1]
    const result = getSelectionOpacities(selected, source, false)
    expect(Object.entries(result.stitchLines).filter(([, opacity]) => opacity.stroke === 1).map(([id]) => id)).toEqual([selected.id])
  })
})
