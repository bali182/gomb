import { describe, expect, it } from 'vitest'
import { d } from '../../testData'
import { accessors } from './index'

describe('HoleAccessor', () => {
  it('shares indexed source objects between strict, optional and detached methods', () => {
    const hole = d.hole({ id: 'hole', componentId: 'root-front' })
    const subProject = d.subProject({ id: 'sub', root: d.rootPanel({ id: 'root' }), holes: [hole] })
    const snapshot = structuredClone(subProject)
    const accessor = accessors.subProject(subProject)
    const byId = accessor.hole.byId
    const optionalById = accessor.optional.hole.byId
    expect(byId('hole')).toBe(hole)
    expect(optionalById('hole')).toBe(hole)
    expect(optionalById('missing')).toBeUndefined()
    expect(() => byId('missing')).toThrow('Missing hole')
    expect(subProject).toEqual(snapshot)
  })
})

it('deduplicates hole names and handles empty collections', () => {
  const subProject = d.subProject({
    id: 'sub',
    root: d.rootPanel({ id: 'root' }),
    holes: [
      d.hole({ id: 'first', name: 'Slot', componentId: 'root-front' }),
      d.hole({ id: 'second', name: 'Slot', componentId: 'root-back' }),
    ],
  })
  const accessor = accessors.subProject(subProject)
  const names = accessor.hole.names
  const optionalNames = accessor.optional.hole.names
  expect(names()).toEqual(new Set(['Slot']))
  expect(optionalNames()).toEqual(names())
  const snapshot = structuredClone(subProject)
  const expectedNames = names()
  for (const getNames of [names, optionalNames]) {
    const result = getNames()
    result.clear()
    result.add('Temporary name')
    expect(names()).toEqual(expectedNames)
    expect(optionalNames()).toEqual(expectedNames)
  }
  expect(subProject).toEqual(snapshot)
  const empty = accessors.subProject({ ...subProject, holes: [] })
  expect(empty.hole.names()).toEqual(new Set([]))
  expect(empty.optional.hole.names()).toEqual(new Set([]))
})
