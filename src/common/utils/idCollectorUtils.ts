import type { ProjectSchema } from '../schemas/project'
import { SubProjectSchema } from '../schemas/subProject'
import type { DeepPartialSchema } from '../schemas/utils'
import { isDefined } from './isDefined'

export const getProjectIds = (project: DeepPartialSchema<ProjectSchema>, ids: Set<string> = new Set()): Set<string> => {
  addId(ids, project.id)
  for (const subProject of project.subProjects ?? []) {
    getSubProjectIds(subProject, ids)
  }
  return ids
}

export const getSubProjectIds = (
  subProject: DeepPartialSchema<SubProjectSchema>,
  ids: Set<string> = new Set(),
): Set<string> => {
  addId(ids, subProject.id)
  for (const constraint of Object.values(subProject.constraints ?? {})) {
    addId(ids, constraint?.id)
    for (const field of constraint?.fields ?? []) {
      addId(ids, field.id)
    }
  }
  for (const component of Object.values(subProject.components ?? {})) {
    addId(ids, component?.id)
  }
  for (const hole of subProject.holes ?? []) {
    addId(ids, hole.id)
  }
  for (const stitchLine of subProject.stitchLines ?? []) {
    addId(ids, stitchLine.id)
  }
  for (const opening of Object.values(subProject.pocketOpenings ?? {})) {
    addId(ids, opening?.id)
  }

  return ids
}

const addId = (ids: Set<string>, id: string | undefined): void => {
  if (isDefined(id)) {
    ids.add(id)
  }
}
