import type { HoleSchema } from '../schemas/hole'
import { accessors } from '../utils/accessors'
import { useSubProject } from './useSubProject'

export const useHole = (id: string): HoleSchema => {
  const { subProject } = useSubProject()
  return accessors.subProject(subProject).hole.byId(id)
}
