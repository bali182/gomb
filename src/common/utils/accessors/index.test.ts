import { describe, expect, it } from 'vitest'
import { getComputedSubProject } from '../../logic/getComputedSubProject'
import { d } from '../../testData'
import { accessors } from './index'

describe('accessor factories', () => {
  it('reuses only the latest project root by object identity', () => {
    const subProject = d.subProject({ id: 'sub', root: d.rootPanel({ id: 'root' }) })
    const project = d.project({ id: 'project', subProjects: [subProject] })
    const root = project
    const sameIdDifferentRoot = { ...root }
    const first = accessors.project(root)
    expect(accessors.project(root)).toBe(first)
    const second = accessors.project(sameIdDifferentRoot)
    expect(second).not.toBe(first)
    expect(accessors.project(sameIdDifferentRoot)).toBe(second)
    expect(accessors.project(root)).not.toBe(first)
    expect(accessors.project(root)).not.toBe(second)
  })

  it('reuses only the latest computedProject root by object identity', () => {
    const subProject = d.subProject({ id: 'sub', root: d.rootPanel({ id: 'root' }) })
    const project = d.project({ id: 'project', subProjects: [subProject] })
    const root = {
      id: project.id,
      name: project.name,
      subProjects: [getComputedSubProject(subProject, project.stitchingSettings)],
    }
    const sameIdDifferentRoot = { ...root }
    const first = accessors.computedProject(root)
    expect(accessors.computedProject(root)).toBe(first)
    const second = accessors.computedProject(sameIdDifferentRoot)
    expect(second).not.toBe(first)
    expect(accessors.computedProject(sameIdDifferentRoot)).toBe(second)
    expect(accessors.computedProject(root)).not.toBe(first)
    expect(accessors.computedProject(root)).not.toBe(second)
  })

  it('reuses only the latest subProject root by object identity', () => {
    const subProject = d.subProject({ id: 'sub', root: d.rootPanel({ id: 'root' }) })
    const root = subProject
    const sameIdDifferentRoot = { ...root }
    const first = accessors.subProject(root)
    expect(accessors.subProject(root)).toBe(first)
    const second = accessors.subProject(sameIdDifferentRoot)
    expect(second).not.toBe(first)
    expect(accessors.subProject(sameIdDifferentRoot)).toBe(second)
    expect(accessors.subProject(root)).not.toBe(first)
    expect(accessors.subProject(root)).not.toBe(second)
  })

  it('reuses only the latest computedSubProject root by object identity', () => {
    const subProject = d.subProject({ id: 'sub', root: d.rootPanel({ id: 'root' }) })
    const project = d.project({ id: 'project', subProjects: [subProject] })
    const root = getComputedSubProject(subProject, project.stitchingSettings)
    const sameIdDifferentRoot = { ...root }
    const first = accessors.computedSubProject(root)
    expect(accessors.computedSubProject(root)).toBe(first)
    const second = accessors.computedSubProject(sameIdDifferentRoot)
    expect(second).not.toBe(first)
    expect(accessors.computedSubProject(sameIdDifferentRoot)).toBe(second)
    expect(accessors.computedSubProject(root)).not.toBe(first)
    expect(accessors.computedSubProject(root)).not.toBe(second)
  })

  it('keeps retained old accessors tied to their own model version', () => {
    const subProject = d.subProject({
      id: 'sub',
      root: d.rootPanel({ id: 'root' }),
      holes: [d.hole({ id: 'old', componentId: 'root' })],
    })
    const first = accessors.subProject(subProject)
    const updated = { ...subProject, holes: [d.hole({ id: 'new', componentId: 'root' })] }
    const second = accessors.subProject(updated)
    expect(first.hole.byId('old')).toBe(subProject.holes[0])
    expect(first.optional.hole.byId('new')).toBeUndefined()
    expect(second.hole.byId('new')).toBe(updated.holes[0])
    expect(second.optional.hole.byId('old')).toBeUndefined()
  })
})
