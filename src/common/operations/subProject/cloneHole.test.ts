import { describe, expect, it } from 'vitest'
import { d } from '../../testData'
import { EN } from '../../translations/en'
import { NameGenerator } from '../../utils/factory/NameGenerator'
import { cloneHole } from './cloneHole'
import { createBaseOperationParams } from './testUtils'

const nameGenerator = new NameGenerator(EN.defaultNames)

const fixture = () =>
  d.subProject({
    id: 'sub',
    bindings: {
      linked: {
        id: 'linked',
        type: 'equal-binding',
        fields: [
          { id: 'root-field', type: 'root-panel-binding-field', modelId: 'root', field: 'width' },
          { id: 'hole-field', type: 'hole-binding-field', modelId: 'hole', field: 'width' },
        ],
      },
    },
    root: d.rootPanel({ id: 'root' }),
    holes: [d.hole({ id: 'hole', componentId: 'root-front', name: 'Hole' })],
  })
describe('cloneHole', () => {
  it('copies only the hole, retaining its owner and inserting after the source', () => {
    const source = fixture()
    const snapshot = structuredClone(source)
    const result = cloneHole(createBaseOperationParams(source, { name: nameGenerator }), { id: 'hole' })
    expect(result.holes).toHaveLength(2)
    expect(result.holes[0]).toBe(source.holes[0])
    expect(result.holes[1]).toEqual({ ...source.holes[0], id: expect.stringMatching(/^hole-/), name: 'Hole 1' })
    expect(result.bindings).toBe(source.bindings)
    expect(result.components).toBe(source.components)
    expect(result.pocketOpenings).toBe(source.pocketOpenings)
    expect(source).toEqual(snapshot)
  })
  it('retains the source for an unknown hole', () => {
    const source = fixture()
    expect(cloneHole(createBaseOperationParams(source, { name: nameGenerator }), { id: 'missing' })).toBe(source)
  })
})
