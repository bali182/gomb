import { describe, expect, expectTypeOf, it, vi } from 'vitest'
import { defaultStitchingSettings } from '../defaultStates'
import { getComputedSubProject } from '../logic/getComputedSubProject'
import type { ComponentSchema } from '../schemas/components'
import type { ComputedComponentSchema } from '../schemas/computed'
import { d } from '../testData'
import { updateComponents } from './updateComponents'

const fixture = () => {
  const root = d.rootPanel({ id: 'root', children: ['panel'] })
  const panel = d.panel({ id: 'panel' })
  return { root, panel, subProject: d.subProject({ id: 'sub', root, components: [panel] }) }
}

describe('updateComponents', () => {
  it('passes no computed component to the plain mapper and retains unchanged references', () => {
    const { subProject, root, panel } = fixture()
    const mapper = vi.fn((_id: string, component: ComponentSchema): ComponentSchema => component)
    const result = updateComponents({ subProject, mapper })
    expect(result).toBe(subProject)
    expect(mapper).toHaveBeenCalledTimes(2)
    expect(mapper).toHaveBeenCalledWith(root.id, root, undefined)
    expect(mapper).toHaveBeenCalledWith(panel.id, panel, undefined)
  })

  it('copies only changed components and leaves the input untouched', () => {
    const { subProject, panel, root } = fixture()
    const snapshot = structuredClone(subProject)
    const result = updateComponents({
      subProject,
      mapper: (id, component) => (id === panel.id ? { ...component, name: 'Renamed' } : component),
    })
    expect(result).not.toBe(subProject)
    expect(result.components).not.toBe(subProject.components)
    expect(result.components.root).toBe(root)
    expect(result.components.panel).toEqual({ ...panel, name: 'Renamed' })
    expect(result.holes).toBe(subProject.holes)
    expect(subProject).toEqual(snapshot)
  })

  it('passes the matching computed component as the third argument', () => {
    const { subProject, root, panel } = fixture()
    const computedSubProject = getComputedSubProject(subProject, defaultStitchingSettings)
    const mapper = vi.fn(
      (_id: string, component: ComponentSchema, _computedComponent: ComputedComponentSchema): ComponentSchema =>
        component,
    )
    expect(updateComponents({ subProject, computedSubProject, mapper })).toBe(subProject)
    expect(mapper).toHaveBeenCalledTimes(2)
    expect(mapper).toHaveBeenCalledWith(root.id, root, computedSubProject.components.root)
    expect(mapper).toHaveBeenCalledWith(panel.id, panel, computedSubProject.components.panel)
  })

  it('infers mapper parameters for both overloads', () => {
    const { subProject } = fixture()
    const computedSubProject = getComputedSubProject(subProject, defaultStitchingSettings)
    updateComponents({
      subProject,
      mapper: (id, component) => {
        expectTypeOf(id).toEqualTypeOf<string>()
        expectTypeOf(component).toEqualTypeOf<ComponentSchema>()
        return component
      },
    })
    updateComponents({
      subProject,
      computedSubProject,
      mapper: (id, component, computedComponent) => {
        expectTypeOf(id).toEqualTypeOf<string>()
        expectTypeOf(component).toEqualTypeOf<ComponentSchema>()
        expectTypeOf(computedComponent).toEqualTypeOf<ComputedComponentSchema>()
        return component
      },
    })
  })
})
