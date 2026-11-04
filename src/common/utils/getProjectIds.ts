import type { ProjectSchema } from '../schemas/project'
import type { DeepPartialSchema } from '../schemas/utils'
import { isDefined } from './isDefined'

export const getProjectIds = (project: DeepPartialSchema<ProjectSchema>): Set<string> => {
  const ids = new Set<string>()
  const addId = (id: string | undefined): void => {
    if (isDefined(id)) {
      ids.add(id)
    }
  }

  addId(project.id)
  for (const subProject of project.subProjects ?? []) {
    addId(subProject.id)
    for (const constraint of Object.values(subProject.constraints ?? {})) {
      addId(constraint?.id)
      for (const field of constraint?.fields ?? []) {
        addId(field.id)
      }
    }
    for (const component of Object.values(subProject.components ?? {})) {
      addId(component?.id)
    }
    for (const hole of subProject.holes ?? []) {
      addId(hole.id)
    }
    for (const stitchLine of subProject.stitchLines ?? []) {
      addId(stitchLine.id)
    }
    for (const opening of Object.values(subProject.pocketOpenings ?? {})) {
      addId(opening?.id)
    }
  }
  return ids
}
