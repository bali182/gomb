import type { HoleSchema } from '../../schemas/hole'
import type { SubProjectSchema } from '../../schemas/subProject'

export type AddHoleParams = {
  hole: HoleSchema
}

export const addHole = (subProject: SubProjectSchema, params: AddHoleParams): SubProjectSchema => {
  const component = subProject.components[params.hole.componentId]
  if (component?.type === 'pocket-cluster') {
    return subProject
  }
  return {
    ...subProject,
    holes: [...subProject.holes, params.hole],
  }
}
