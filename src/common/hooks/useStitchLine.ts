import type { StitchLineSchema } from '../schemas/stitching'
import { accessors } from '../utils/accessors'
import { useSubProject } from './useSubProject'

export const useStitchLine = (id: string): StitchLineSchema => {
  const { subProject } = useSubProject()
  return accessors.subProject(subProject).stitchLine.byId(id)
}
