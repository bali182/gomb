import type { ComponentSchema } from '../schemas/components'
import type { ComputedComponentSchema } from '../schemas/computed'
import type { ComputedSubProjectSchema, SubProjectSchema } from '../schemas/subProject'
import { accessors } from './accessors'
import { isDefined } from './isDefined'

type UpdateComponentsWithoutComputedParams = {
  subProject: SubProjectSchema
  mapper: (id: string, component: ComponentSchema) => ComponentSchema
}

type UpdateComponentsWithComputedParams = {
  subProject: SubProjectSchema
  computedSubProject: ComputedSubProjectSchema
  mapper: (id: string, component: ComponentSchema, computedComponent: ComputedComponentSchema) => ComponentSchema
}

type UpdateComponentsParams = {
  subProject: SubProjectSchema
  computedSubProject?: ComputedSubProjectSchema
  mapper: (id: string, component: ComponentSchema, computedComponent?: ComputedComponentSchema) => ComponentSchema
}

type UpdateComponents = {
  (params: UpdateComponentsWithComputedParams): SubProjectSchema
  (params: UpdateComponentsWithoutComputedParams): SubProjectSchema
}

const _updateComponents = ({ subProject, computedSubProject, mapper }: UpdateComponentsParams): SubProjectSchema => {
  let components = subProject.components
  const accessor = isDefined(computedSubProject) ? accessors.computedSubProject(computedSubProject) : undefined

  for (const [id, component] of Object.entries(subProject.components)) {
    const updatedComponent = mapper(id, component, accessor?.component?.byId?.(id))
    if (updatedComponent === component) {
      continue
    }
    if (components === subProject.components) {
      components = { ...subProject.components }
    }
    components[id] = updatedComponent
  }

  return components === subProject.components ? subProject : { ...subProject, components }
}

export const updateComponents = _updateComponents as UpdateComponents
