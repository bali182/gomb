import { describe, expect, it, vi } from 'vitest'
import { d } from '../testData'
import { EN } from '../translations/en'
import { createProject } from './createProject'
import { createSubProject } from './createSubProject'
import { NameGenerator } from './factory/NameGenerator'
import { ReadonlyModelObjectFactory } from './factory/ReadonlyModelObjectFactory'
import { IdGenerator } from './random/IdGenerator'

const modelFactory = new ReadonlyModelObjectFactory(new IdGenerator(), new NameGenerator(EN.defaultNames))

describe('createSubProject', () => {
  it('creates a root and straight default with factory-generated names', () => {
    const project = createProject('Project')
    const snapshot = structuredClone(project)
    const forbid = vi.spyOn(IdGenerator.prototype, 'getAndForbid')
    try {
      const subProject = createSubProject({ project, modelFactory })
      expect(subProject.constraints).toEqual({})
      expect(subProject.id).toMatch(/^sub-project-/)
      expect(subProject.root).toMatch(/^root-panel-/)
      expect(subProject.defaultPocketOpening).toMatch(/^straight-pocket-opening-/)
      expect(subProject.components[subProject.root]).toMatchObject({ type: 'root-panel', name: 'Module 1' })
      expect(subProject.pocketOpenings[subProject.defaultPocketOpening]).toEqual({
        id: subProject.defaultPocketOpening,
        name: 'Straight 1',
        type: 'straight',
      })
      expect(forbid).not.toHaveBeenCalled()
      expect(project).toEqual(snapshot)
    } finally {
      forbid.mockRestore()
    }
  })

  it('uses root names across subprojects and current project stitching settings', () => {
    const project = d.project({
      id: 'project',
      subProjects: [
        d.subProject({ id: 'first', root: d.rootPanel({ id: 'root1', name: 'Module 1' }) }),
        d.subProject({ id: 'second', root: d.rootPanel({ id: 'root2', name: 'Module 2' }) }),
      ],
    })
    const createRoot = vi.spyOn(modelFactory, 'createRootPanel')
    try {
      const subProject = createSubProject({ project, modelFactory })
      expect(subProject.components[subProject.root].name).toBe('Module 3')
      expect(createRoot).toHaveBeenCalledWith(expect.objectContaining({ stitchingSettings: project.stitchingSettings }))
    } finally {
      createRoot.mockRestore()
    }
  })
})
