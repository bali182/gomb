import { describe, expect, it } from 'vitest'
import { d } from '../../testData'
import { setDefaultPocketOpening } from './setDefaultPocketOpening'
import { createBaseOperationParams } from './testUtils'

const fixture = () =>
  d.subProject({
    id: 'sub',
    root: d.rootPanel({ id: 'root' }),
    pocketOpenings: [{ id: 'other', type: 'straight', name: 'Other' }],
  })

describe('setDefaultPocketOpening', () => {
  it('changes the default reference while preserving the source and its collections', () => {
    const source = fixture()
    const snapshot = structuredClone(source)
    const result = setDefaultPocketOpening(createBaseOperationParams(source), { id: 'other' })
    expect(result.defaultPocketOpening).toBe('other')
    expect(result.pocketOpenings).toBe(source.pocketOpenings)
    expect(result.components).toBe(source.components)
    expect(source).toEqual(snapshot)
  })

  it('returns the original snapshot when the opening is already the default', () => {
    const source = fixture()
    expect(setDefaultPocketOpening(createBaseOperationParams(source), { id: source.defaultPocketOpening })).toBe(source)
  })

  it('returns the original snapshot for an unknown opening', () => {
    const source = fixture()
    expect(setDefaultPocketOpening(createBaseOperationParams(source), { id: 'missing' })).toBe(source)
  })
})
