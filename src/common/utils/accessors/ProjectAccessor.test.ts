import { describe, expect, it } from 'vitest'
import { d } from '../../testData'
import { accessors } from './index'

describe('ProjectAccessor', () => {
  it('offers strict and optional source lookups with bound methods', () => {
    const subProject = d.subProject({ id: 'sub', root: d.rootPanel({ id: 'root' }) })
    const project = d.project({ id: 'project', subProjects: [subProject] })
    const snapshot = structuredClone(project)
    const accessor = accessors.project(project)
    const byId = accessor.subProject
    expect(byId(subProject.id)).toBe(subProject)
    expect(accessor.optional.subProject(subProject.id)).toBe(subProject)
    expect(accessor.optional.subProject('missing')).toBeUndefined()
    expect(() => byId('missing')).toThrow('Missing sub-project from project')
    expect(project).toEqual(snapshot)
  })
})
