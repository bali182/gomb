import { describe, expect, it, vi } from 'vitest'
import { defaultStitchingSettings } from '../defaultStates'
import { createSubProject } from './createSubProject'
import { IdGenerator } from './random/IdGenerator'

describe('createSubProject', () => {
  it('uses the supplied generator without reserving IDs with distinct prefixes', () => {
    const generator = new IdGenerator()
    const generate = vi.spyOn(generator, 'get')
    const forbid = vi.spyOn(generator, 'forbidOne')
    const subProject = createSubProject('Root', defaultStitchingSettings, 'Straight', generator)
    expect(subProject.constraints).toEqual({})
    expect(subProject.id).toMatch(/^sub-project-/)
    expect(subProject.root).toMatch(/^component-/)
    expect(subProject.defaultPocketOpening).toMatch(/^pocket-opening-/)
    expect(subProject.components[subProject.root]).toMatchObject({
      id: subProject.root,
      type: 'root-panel',
      name: 'Root',
    })
    expect(subProject.pocketOpenings[subProject.defaultPocketOpening]).toEqual({
      id: subProject.defaultPocketOpening,
      name: 'Straight',
      type: 'straight',
    })
    expect(generate.mock.calls.map(([type]) => type).sort()).toEqual(['component', 'pocket-opening', 'sub-project'])
    expect(forbid).not.toHaveBeenCalled()
  })
})
