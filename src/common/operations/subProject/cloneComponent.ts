import type { ComponentSchema } from '../../schemas/components'
import type { ConstraintFieldSchema, ConstraintSchema } from '../../schemas/constraints'
import type { HoleSchema } from '../../schemas/hole'
import type { NameGeneratorSchema } from '../../schemas/idGenerator'
import type { BaseSubProjectOperationParamsSchema, CloneComponentParamsSchema } from '../../schemas/operations'
import type { PocketOpeningSchema } from '../../schemas/pocketOpening'
import type { StitchLineSchema } from '../../schemas/stitching'
import type { SubProjectSchema } from '../../schemas/subProject'
import { accessors } from '../../utils/accessors'
import { isDefined } from '../../utils/isDefined'
import { narrowers } from '../../utils/narrowers'
import {
  getCloneComponentSelection,
  normalizeCloneComponentParams,
  type CloneComponentSelection,
} from './utils/cloneComponentSelection'
import { canCloneComponent } from './utils/componentRules'
import { getCloneIdMappings } from './utils/getCloneIdMappings'

export const cloneComponent = (
  { subProject, id: idGenerator, name: nameGenerator }: BaseSubProjectOperationParamsSchema,
  params: CloneComponentParamsSchema,
): SubProjectSchema => {
  const accessor = accessors.subProject(subProject)
  const source = accessor.optional.component.byId(params.rootId)
  if (!isDefined(source) || !canCloneComponent(source)) {
    return subProject
  }
  const parent = accessor.optional.component.parent(source.id)
  if (!isDefined(parent)) {
    return subProject
  }
  const sourceIndex = parent.children.indexOf(source.id)
  const normalized = normalizeCloneComponentParams(subProject, params)
  const selection = getCloneComponentSelection(subProject, normalized)
  if (sourceIndex < 0 || !selection.valid) {
    return subProject
  }
  const idMappings = getCloneIdMappings(subProject, idGenerator)
  const clonedComponents = cloneSelectedComponents(subProject, normalized, selection, idMappings, nameGenerator)
  return {
    ...subProject,
    components: {
      ...subProject.components,
      ...clonedComponents,
      [parent.id]: {
        ...parent,
        children: [
          ...parent.children.slice(0, sourceIndex + 1),
          idMappings[source.id],
          ...parent.children.slice(sourceIndex + 1),
        ],
      },
    },
    holes: cloneSelectedHoles(subProject, selection, idMappings, nameGenerator),
    stitchLines: cloneSelectedStitchLines(subProject, selection, idMappings, nameGenerator),
    pocketOpenings: cloneSelectedOpenings(subProject, selection, idMappings, nameGenerator),
    constraints: cloneSelectedConstraints(subProject, normalized, selection, idMappings),
  }
}

const cloneSelectedComponents = (
  subProject: SubProjectSchema,
  params: CloneComponentParamsSchema,
  selection: CloneComponentSelection,
  idMappings: Readonly<Record<string, string>>,
  nameGenerator: NameGeneratorSchema,
): Record<string, ComponentSchema> => {
  const usedNames = new Set(Object.values(subProject.components).map((component) => component.name))
  const result: Record<string, ComponentSchema> = {}
  for (const { component } of selection.components) {
    if (!selection.clonedModelIds.has(component.id)) {
      continue
    }
    const cloned: ComponentSchema = {
      ...component,
      id: idMappings[component.id],
      name: nameGenerator.getByBaseNameAndForbid(component.name, usedNames),
      children: component.children.filter((id) => selection.clonedModelIds.has(id)).map((id) => idMappings[id]),
    }
    result[cloned.id] = narrowers.is.pocket(cloned)
      ? {
          ...cloned,
          openingId: getClonedOpeningId(subProject, params, cloned.openingId, idMappings),
        }
      : cloned
  }
  return result
}

const getClonedOpeningId = (
  subProject: SubProjectSchema,
  params: CloneComponentParamsSchema,
  openingId: string,
  idMappings: Readonly<Record<string, string>>,
): string => {
  switch (params.pocketOpenings[openingId]?.action) {
    case 'clone':
      return idMappings[openingId]
    case 'set-to-default':
      return accessors.subProject(subProject).pocketOpening.defaultOpening().id
    case 'keep-original':
    default:
      return openingId
  }
}

const cloneSelectedHoles = (
  subProject: SubProjectSchema,
  selection: CloneComponentSelection,
  idMappings: Readonly<Record<string, string>>,
  nameGenerator: NameGeneratorSchema,
): HoleSchema[] => {
  const usedNames = new Set(subProject.holes.map((hole) => hole.name))
  const cloned = selection.holes
    .filter((hole) => selection.clonedModelIds.has(hole.id))
    .map(
      (hole): HoleSchema => ({
        ...hole,
        id: idMappings[hole.id],
        componentId: idMappings[hole.componentId],
        name: nameGenerator.getByBaseNameAndForbid(hole.name, usedNames),
      }),
    )
  return cloned.length === 0 ? subProject.holes : [...subProject.holes, ...cloned]
}

const cloneSelectedStitchLines = (
  subProject: SubProjectSchema,
  selection: CloneComponentSelection,
  idMappings: Readonly<Record<string, string>>,
  nameGenerator: NameGeneratorSchema,
): StitchLineSchema[] => {
  const usedNames = new Set(subProject.stitchLines.map((stitchLine) => stitchLine.name))
  const cloned = selection.stitchLines
    .filter((stitchLine) => selection.clonedModelIds.has(stitchLine.id))
    .map(
      (stitchLine): StitchLineSchema => ({
        ...stitchLine,
        id: idMappings[stitchLine.id],
        targetId: idMappings[stitchLine.targetId],
        name: nameGenerator.getByBaseNameAndForbid(stitchLine.name, usedNames),
      }),
    )
  return cloned.length === 0 ? subProject.stitchLines : [...subProject.stitchLines, ...cloned]
}

const cloneSelectedOpenings = (
  subProject: SubProjectSchema,
  selection: CloneComponentSelection,
  idMappings: Readonly<Record<string, string>>,
  nameGenerator: NameGeneratorSchema,
): Record<string, PocketOpeningSchema> => {
  const usedNames = new Set(Object.values(subProject.pocketOpenings).map((opening) => opening.name))
  const cloned = selection.pocketOpenings
    .filter((opening) => selection.clonedModelIds.has(opening.id))
    .map(
      (opening): PocketOpeningSchema => ({
        ...opening,
        id: idMappings[opening.id],
        name: nameGenerator.getByBaseNameAndForbid(opening.name, usedNames),
      }),
    )
  return cloned.length === 0
    ? subProject.pocketOpenings
    : {
        ...subProject.pocketOpenings,
        ...Object.fromEntries(cloned.map((opening) => [opening.id, opening])),
      }
}

const cloneSelectedConstraints = (
  subProject: SubProjectSchema,
  params: CloneComponentParamsSchema,
  selection: CloneComponentSelection,
  idMappings: Readonly<Record<string, string>>,
): Record<string, ConstraintSchema> => {
  let constraints = subProject.constraints
  for (const row of selection.constraints) {
    const action = params.constraints[row.constraint.id]?.action ?? 'ignore'
    if (action === 'ignore') {
      continue
    }
    const fields = row.fields.map(
      (field): ConstraintFieldSchema => ({ ...field, id: idMappings[field.id], modelId: idMappings[field.modelId] }),
    )
    switch (action) {
      case 'add-to-existing': {
        constraints = {
          ...constraints,
          [row.constraint.id]: { ...row.constraint, fields: [...row.constraint.fields, ...fields] },
        }
        break
      }
      case 'constrain-separately': {
        const id = idMappings[row.constraint.id]
        constraints = { ...constraints, [id]: { ...row.constraint, id, fields } }
        break
      }
    }
  }
  return constraints
}
