import type { ComputedComponentSchema } from '../schemas/computed'
import { accessors } from '../utils/accessors'
import { useSubProject } from './useSubProject'

export const useComputedComponent = <T extends ComputedComponentSchema = ComputedComponentSchema>(id: string): T => {
  const { computedSubProject: computedProject } = useSubProject()
  return accessors.computedSubProject(computedProject).component.byId(id) as T
}
