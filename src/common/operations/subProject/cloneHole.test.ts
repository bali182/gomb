import { describe, expect, it } from 'vitest'
import { d } from '../../testData'
import { IdGenerator } from '../../utils/random/IdGenerator'
import { cloneHole } from './cloneHole'
import { getUnusedName } from './utils/getUnusedName'

const fixture = () =>
  d.subProject({
    id: 'sub',
    root: d.rootPanel({ id: 'root' }),
    holes: [d.hole({ id: 'hole', componentId: 'root', name: 'Hole' })],
  })
describe('cloneHole', () => {
  it('copies only the hole, retaining its owner and inserting after the source', () => {
    const source = fixture()
    const snapshot = structuredClone(source)
    const result = cloneHole(source, { holeId: 'hole', idGenerator: new IdGenerator(), getUnusedName })
    expect(result.holes).toHaveLength(2)
    expect(result.holes[0]).toBe(source.holes[0])
    expect(result.holes[1]).toEqual({ ...source.holes[0], id: expect.stringMatching(/^hole-/), name: 'Hole 1' })
    expect(result.components).toBe(source.components)
    expect(result.pocketOpenings).toBe(source.pocketOpenings)
    expect(source).toEqual(snapshot)
  })
  it('retains the source for an unknown hole', () => {
    const source = fixture()
    expect(cloneHole(source, { holeId: 'missing', idGenerator: new IdGenerator(), getUnusedName })).toBe(source)
  })
})
