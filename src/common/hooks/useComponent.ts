import type { ComponentSchema } from '../schemas/components'
import { accessors } from '../utils/accessors'
import { useSubProject } from './useSubProject'

export const useComponent = <T extends ComponentSchema = ComponentSchema>(id: string): T => {
  const { subProject } = useSubProject()
  return accessors.subProject(subProject).component(id) as T
}
