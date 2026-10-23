import type { ComputedSubProjectSchema, SubProjectSchema } from '../schemas/subProject'
export const deletePocketClusterHoles = (
  subProject: SubProjectSchema,
  _computed: ComputedSubProjectSchema,
): SubProjectSchema => {
  const holes = subProject.holes.filter((hole) => subProject.components[hole.componentId]?.type !== 'pocket-cluster')
  return holes.length === subProject.holes.length ? subProject : { ...subProject, holes }
}
