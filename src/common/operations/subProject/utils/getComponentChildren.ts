import type { ComponentSchema } from '../../../schemas/components'
import type { SubProjectSchema } from '../../../schemas/subProject'
import { accessors } from '../../../utils/accessors'

export const getComponentChildren = (component: ComponentSchema, subProject: SubProjectSchema): ComponentSchema[] => {
  const accessor = accessors.subProject(subProject)
  return component.children.map((id) => accessor.component(id))
}
