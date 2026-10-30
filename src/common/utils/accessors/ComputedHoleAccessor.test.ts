import { describe, expect, it } from 'vitest'
import { getComputedSubProject } from '../../logic/getComputedSubProject'
import { d } from '../../testData'
import { accessors } from './index'

describe('ComputedHoleAccessor', () => {
  it('reads holes from the ID record and keeps detached methods usable', () => {
    const subProject = d.subProject({
      id: 'sub',
      root: d.rootPanel({ id: 'root' }),
      holes: [d.hole({ id: 'hole', componentId: 'root' })],
    })
    const project = d.project({ id: 'project', subProjects: [subProject] })
    const computed = getComputedSubProject(subProject, project.stitchingSettings)
    const accessor = accessors.computedSubProject(computed)
    const byId = accessor.hole.byId
    expect(byId('hole')).toBe(computed.holes.hole)
    expect(accessor.optional.hole.byId('hole')).toBe(computed.holes.hole)
    expect(accessor.optional.hole.byId('missing')).toBeUndefined()
    expect(() => byId('missing')).toThrow('Missing hole')
  })
})
