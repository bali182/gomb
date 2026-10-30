import { describe, expect, it } from 'vitest'
import { getComputedSubProject } from '../../logic/getComputedSubProject'
import { d } from '../../testData'
import { accessors } from './index'

describe('ComputedProjectAccessor', () => {
  it('returns a subproject or reports its absence with the project context', () => {
    const subProject = d.subProject({ id: 'sub', root: d.rootPanel({ id: 'root' }) })
    const project = { ...d.project({ id: 'project', subProjects: [subProject] }), name: 'Wallet' }
    const computed = getComputedSubProject(subProject, project.stitchingSettings)
    const accessor = accessors.computedProject({ id: project.id, name: project.name, subProjects: [computed] })
    const subProjectById = accessor.subProject
    expect(subProjectById(subProject.id)).toBe(computed)
    expect(accessor.optional.subProject(subProject.id)).toBe(computed)
    expect(accessor.optional.subProject('missing')).toBeUndefined()
    expect(() => subProjectById('missing')).toThrow(`Missing sub-project from computed project ${project.id} (Wallet).`)
  })
})
