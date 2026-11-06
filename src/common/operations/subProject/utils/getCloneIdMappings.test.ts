import { describe, expect, it, vi } from 'vitest'
import { d } from '../../../testData'
import { getProjectIds } from '../../../utils/idCollectorUtils'
import { IdGenerator } from '../../../utils/random/IdGenerator'
import { getCloneIdMappings } from './getCloneIdMappings'

const fixture = () =>
  d.subProject({
    id: 'sub',
    constraints: {
      constraint: {
        id: 'constraint',
        type: 'equal-constraint',
        fields: [
          { id: 'first-field', type: 'panel-constraint-field', modelId: 'panel', field: 'width' },
          { id: 'second-field', type: 'panel-constraint-field', modelId: 'unused-panel', field: 'height' },
        ],
      },
    },
    root: d.rootPanel({ id: 'root', children: ['panel'] }),
    components: [d.panel({ id: 'panel' }), d.panel({ id: 'unused-panel' })],
    holes: [d.hole({ id: 'hole', componentId: 'panel' })],
    stitchLines: [d.componentBoundsStitchLine({ id: 'stitch', targetId: 'hole', targetType: 'hole' })],
    pocketOpenings: [{ id: 'unused-opening', name: 'Unused', type: 'straight' }],
  })

describe('getCloneIdMappings', () => {
  it('creates correctly prefixed IDs for every stored object and reserves repeated categories', () => {
    const source = fixture()
    const snapshot = structuredClone(source)
    const sourceIds = getProjectIds({ subProjects: [source] })
    const reserve = vi.spyOn(IdGenerator.prototype, 'getAndForbid')
    const mapping = getCloneIdMappings(source)
    expect(new Set(Object.keys(mapping))).toEqual(sourceIds)
    expect(new Set(Object.values(mapping)).size).toBe(sourceIds.size)
    expect(mapping[source.id]).toMatch(/^sub-project-/)
    for (const component of Object.values(source.components)) {
      expect(mapping[component.id].startsWith(`${component.type}-`)).toBe(true)
    }
    expect(mapping.constraint).toMatch(/^equal-constraint-/)
    expect(mapping['first-field']).toMatch(/^panel-constraint-field-/)
    expect(mapping['second-field']).toMatch(/^panel-constraint-field-/)
    expect(mapping.hole).toMatch(/^hole-/)
    expect(mapping.stitch).toMatch(/^component-bounds-stitch-line-/)
    for (const opening of Object.values(source.pocketOpenings)) {
      expect(mapping[opening.id]).toMatch(/^straight-pocket-opening-/)
    }
    expect(reserve).toHaveBeenCalledTimes(sourceIds.size - 1)
    expect(reserve).not.toHaveBeenCalledWith('sub-project')
    for (const id of Object.values(mapping)) {
      expect(sourceIds.has(id)).toBe(false)
    }
    expect(source).toEqual(snapshot)
    reserve.mockRestore()
  })

  it.each(['panel', 'constraint', 'first-field'])(
    'throws if source ID %s is duplicated across object types',
    (duplicateId) => {
      const source = fixture()
      source.holes[0].id = duplicateId
      expect(() => getCloneIdMappings(source)).toThrow('Duplicate source IDs in clone mapping')
    },
  )
})
