import { describe, expect, it, vi } from 'vitest'
import { d } from '../../../testData'
import { getProjectIds } from '../../../utils/getProjectIds'
import { IdGenerator } from '../../../utils/random/IdGenerator'
import { getCloneIdMappings } from './getCloneIdMappings'

const fixture = () =>
  d.subProject({
    id: 'sub',
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
    const generator = new IdGenerator(sourceIds)
    const reserve = vi.spyOn(generator, 'getAndForbid')
    const mapping = getCloneIdMappings(source, generator)
    expect(new Set(Object.keys(mapping))).toEqual(sourceIds)
    expect(new Set(Object.values(mapping)).size).toBe(sourceIds.size)
    expect(mapping[source.id]).toMatch(/^sub-project-/)
    for (const component of Object.values(source.components)) {
      expect(mapping[component.id]).toMatch(/^component-/)
    }
    expect(mapping.hole).toMatch(/^hole-/)
    expect(mapping.stitch).toMatch(/^stitch-line-/)
    for (const opening of Object.values(source.pocketOpenings)) {
      expect(mapping[opening.id]).toMatch(/^pocket-opening-/)
    }
    expect(reserve).toHaveBeenCalledTimes(sourceIds.size - 1)
    expect(reserve).not.toHaveBeenCalledWith('sub-project')
    for (const id of Object.values(mapping)) {
      expect(sourceIds.has(id)).toBe(false)
    }
    expect(source).toEqual(snapshot)
  })

  it('throws if duplicate source IDs collapse entries in the record', () => {
    const source = fixture()
    source.holes[0].id = 'panel'
    expect(() => getCloneIdMappings(source, new IdGenerator())).toThrow('Duplicate source IDs in clone mapping')
  })
})
