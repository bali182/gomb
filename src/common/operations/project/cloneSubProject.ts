import type { ComponentSchema } from '../../schemas/components'
import type { ConstraintFieldSchema, ConstraintSchema } from '../../schemas/constraints'
import type { NameGeneratorSchema } from '../../schemas/idGenerator'
import type { PocketOpeningSchema } from '../../schemas/pocketOpening'
import type { ProjectSchema } from '../../schemas/project'
import type { SubProjectSchema } from '../../schemas/subProject'
import { accessors } from '../../utils/accessors'
import { isDefined } from '../../utils/isDefined'
import { narrowers } from '../../utils/narrowers'
import { IdGenerator } from '../../utils/random/IdGenerator'
import { cloneComponentTree } from '../subProject/utils/cloneComponentTree'
import { getCloneIdMappings } from '../subProject/utils/getCloneIdMappings'

export type CloneSubProjectParams = {
  nameGenerator: NameGeneratorSchema
  subProject: SubProjectSchema
}

export const cloneSubProject = (
  project: ProjectSchema,
  { subProject: sourceSubProject, nameGenerator }: CloneSubProjectParams,
): ProjectSchema => {
  const sourceRootPanel = accessors.subProject(sourceSubProject).optional.component.rootPanel()

  if (!isDefined(sourceRootPanel)) {
    return project
  }

  const idMappings = getCloneIdMappings(sourceSubProject, new IdGenerator())
  const cloneResult = cloneComponentTree({
    subProject: sourceSubProject,
    componentId: sourceSubProject.root,
    settings: { cloneComponentTree: true, cloneHoles: true, cloneStitchLines: true },
    idMappings,
    nameGenerator,
    preserveNames: true,
  })

  if (!isDefined(cloneResult)) {
    return project
  }

  const clonedRoot = cloneResult.clonedComponents[cloneResult.clonedRootId]

  if (!isDefined(clonedRoot)) {
    return project
  }

  const usedRootNames = new Set(
    project.subProjects
      .map((subProject) => accessors.subProject(subProject).optional.component.rootPanel())
      .filter(isDefined)
      .map((root) => root.name),
  )
  const rootName = nameGenerator.getByBaseName(sourceRootPanel.name, usedRootNames)
  const components = Object.fromEntries(
    Object.values(cloneResult.clonedComponents).map((component): [string, ComponentSchema] => [
      component.id,
      narrowers.is.pocket(component) ? { ...component, openingId: idMappings[component.openingId] } : component,
    ]),
  )

  return {
    ...project,
    subProjects: [
      ...project.subProjects,
      {
        components: {
          ...components,
          [cloneResult.clonedRootId]: {
            ...clonedRoot,
            name: rootName,
          },
        },
        constraints: Object.fromEntries(
          Object.values(sourceSubProject.constraints).map((constraint): [string, ConstraintSchema] => [
            idMappings[constraint.id],
            {
              ...constraint,
              id: idMappings[constraint.id],
              fields: constraint.fields.map(
                (field): ConstraintFieldSchema => ({
                  ...field,
                  id: idMappings[field.id],
                  modelId: idMappings[field.modelId],
                }),
              ),
            },
          ]),
        ),
        holes: cloneResult.clonedHoles,
        id: idMappings[sourceSubProject.id],
        root: cloneResult.clonedRootId,
        stitchLines: cloneResult.clonedStitchLines,
        defaultPocketOpening: idMappings[sourceSubProject.defaultPocketOpening],
        pocketOpenings: Object.fromEntries(
          Object.values(sourceSubProject.pocketOpenings).map((opening): [string, PocketOpeningSchema] => [
            idMappings[opening.id],
            { ...opening, id: idMappings[opening.id] },
          ]),
        ),
      },
    ],
  }
}
