import { describe, expect, it } from 'vitest'
import { d } from '../../testData'
import { accessors } from './index'

describe('HoleAccessor', () => {
  it('shares indexed source objects between strict, optional and detached methods', () => {
    const hole = d.hole({ id: 'hole', componentId: 'root' })
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
