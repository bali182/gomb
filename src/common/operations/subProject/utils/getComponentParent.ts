import type { ComponentSchema } from '../../../schemas/components'
import type { SubProjectSchema } from '../../../schemas/subProject'

export const getComponentParent = (componentId: string, subProject: SubProjectSchema): ComponentSchema | undefined => {
  return Object.values(subProject.components).find((component) => component.children.includes(componentId))
}
