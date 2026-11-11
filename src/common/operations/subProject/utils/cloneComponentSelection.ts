import type { ComponentSchema } from '../../../schemas/components'
import type { ConstraintFieldSchema, ConstraintSchema } from '../../../schemas/constraints'
import type { HoleSchema } from '../../../schemas/hole'
import type { CloneComponentParamsSchema, CloneRelatedModelSchema } from '../../../schemas/operations'
import type { PocketOpeningSchema } from '../../../schemas/pocketOpening'
import type { StitchLineSchema } from '../../../schemas/stitching'
import type { SubProjectSchema } from '../../../schemas/subProject'
import { accessors } from '../../../utils/accessors'
import { isDefined } from '../../../utils/isDefined'
import { narrowers } from '../../../utils/narrowers'

export type CloneComponentRow = {
  component: ComponentSchema
  disabled: boolean
}

export type CloneConstraintRow = {
  constraint: ConstraintSchema
  fields: ConstraintFieldSchema[]
  canAddToExisting: boolean
  canConstrainSeparately: boolean
}

export type CloneComponentSelection = {
  valid: boolean
  components: CloneComponentRow[]
  holes: HoleSchema[]
  stitchLines: StitchLineSchema[]
  pocketOpenings: PocketOpeningSchema[]
  constraints: CloneConstraintRow[]
  clonedModelIds: Set<string>
}

export const createCloneComponentParams = (subProject: SubProjectSchema, rootId: string): CloneComponentParamsSchema =>
  normalizeCloneComponentParams(subProject, {
    rootId,
    children: {},
    holes: {},
    stitchLines: {},
    pocketOpenings: {},
    constraints: {},
  })

export const normalizeCloneComponentParams = (
  subProject: SubProjectSchema,
  params: CloneComponentParamsSchema,
): CloneComponentParamsSchema => {
  const components = collectComponents(subProject, params.rootId)
  const children: Record<string, CloneRelatedModelSchema> = {}
  const clonedModelIds = new Set<string>([params.rootId])
  const accessor = accessors.subProject(subProject)
  for (const component of components ?? []) {
    if (component.id === params.rootId) {
      continue
    }
    const parent = accessor.component.parent(component.id)
    const parentCloned = clonedModelIds.has(parent.id)
    const required = narrowers.is.frontPocket(component) && narrowers.is.pocketCluster(parent)
    const action = !parentCloned ? 'ignore' : required ? 'clone' : (params.children[component.id]?.action ?? 'clone')
    children[component.id] = { action }
    if (action === 'clone') {
      clonedModelIds.add(component.id)
    }
  }
  const holes = normalizeRelatedModels(
    subProject.holes.filter((hole) => clonedModelIds.has(hole.componentId)),
    params.holes,
    clonedModelIds,
  )
  const stitchLines = normalizeRelatedModels(
    subProject.stitchLines.filter((stitchLine) => clonedModelIds.has(stitchLine.targetId)),
    params.stitchLines,
    clonedModelIds,
  )
  const pocketOpenings: CloneComponentParamsSchema['pocketOpenings'] = {}
  for (const component of components ?? []) {
    if (!clonedModelIds.has(component.id) || !narrowers.is.pocket(component)) {
      continue
    }
    const opening = accessor.optional.pocketOpening.byId(component.openingId)
    if (!isDefined(opening)) {
      continue
    }
    const action = params.pocketOpenings[opening.id]?.action ?? 'keep-original'
    pocketOpenings[opening.id] = { action }
    if (action === 'clone') {
      clonedModelIds.add(opening.id)
    }
  }
  const normalized: CloneComponentParamsSchema = {
    rootId: params.rootId,
    children,
    holes,
    stitchLines,
    pocketOpenings,
    constraints: {},
  }
  for (const row of getConstraintRows(subProject, normalized, clonedModelIds)) {
    const action = params.constraints[row.constraint.id]?.action ?? 'ignore'
    normalized.constraints[row.constraint.id] = {
      action:
        (action === 'add-to-existing' && !row.canAddToExisting) ||
        (action === 'constrain-separately' && !row.canConstrainSeparately)
          ? 'ignore'
          : action,
    }
  }
  return normalized
}

export const getCloneComponentSelection = (
  subProject: SubProjectSchema,
  params: CloneComponentParamsSchema,
): CloneComponentSelection => {
  const normalized = normalizeCloneComponentParams(subProject, params)
  const components = collectComponents(subProject, normalized.rootId)
  const accessor = accessors.subProject(subProject)
  const clonedModelIds = new Set<string>([normalized.rootId])
  for (const record of [normalized.children, normalized.holes, normalized.stitchLines, normalized.pocketOpenings]) {
    for (const [id, value] of Object.entries(record)) {
      if (value.action === 'clone') {
        clonedModelIds.add(id)
      }
    }
  }
  return {
    valid: isDefined(components),
    components: (components ?? []).map((component): CloneComponentRow => {
      const parent = accessor.optional.component.parent(component.id)
      return {
        component,
        disabled:
          component.id === normalized.rootId ||
          (isDefined(parent) &&
            (!clonedModelIds.has(parent.id) ||
              (narrowers.is.pocketCluster(parent) && narrowers.is.frontPocket(component)))),
      }
    }),
    holes: subProject.holes.filter((hole) => isDefined(normalized.holes[hole.id])),
    stitchLines: subProject.stitchLines.filter((stitchLine) => isDefined(normalized.stitchLines[stitchLine.id])),
    pocketOpenings: Object.values(subProject.pocketOpenings).filter((opening) =>
      isDefined(normalized.pocketOpenings[opening.id]),
    ),
    constraints: getConstraintRows(subProject, normalized, clonedModelIds),
    clonedModelIds,
  }
}

const collectComponents = (subProject: SubProjectSchema, rootId: string): ComponentSchema[] | undefined => {
  const accessor = accessors.subProject(subProject)
  const visited = new Set<string>()
  const components: ComponentSchema[] = []
  const visit = (id: string): boolean => {
    const component = accessor.optional.component.byId(id)
    if (!isDefined(component) || visited.has(id)) {
      return false
    }
    visited.add(id)
    components.push(component)
    for (const childId of component.children) {
      if (!visit(childId)) {
        return false
      }
    }
    return true
  }
  return visit(rootId) ? components : undefined
}

const normalizeRelatedModels = (
  models: (HoleSchema | StitchLineSchema)[],
  previous: Record<string, CloneRelatedModelSchema>,
  clonedModelIds: Set<string>,
): Record<string, CloneRelatedModelSchema> => {
  const result: Record<string, CloneRelatedModelSchema> = {}
  for (const model of models) {
    const action = previous[model.id]?.action ?? 'clone'
    result[model.id] = { action }
    if (action === 'clone') {
      clonedModelIds.add(model.id)
    }
  }
  return result
}

const getConstraintRows = (
  subProject: SubProjectSchema,
  params: CloneComponentParamsSchema,
  clonedModelIds: ReadonlySet<string>,
): CloneConstraintRow[] => {
  const accessor = accessors.subProject(subProject)
  const rows: CloneConstraintRow[] = []
  for (const constraint of Object.values(subProject.constraints)) {
    const fields = constraint.fields.filter(
      (field) => clonedModelIds.has(field.modelId) && isDefined(accessor.optional.constraint.model(field)),
    )
    if (fields.length === 0) {
      continue
    }
    const openingConflict = fields.some((field) => {
      if (field.field !== 'openingId') {
        return false
      }
      const component = accessor.optional.component.pocket(field.modelId)
      if (!isDefined(component)) {
        return false
      }
      const action = params.pocketOpenings[component.openingId]?.action
      return (
        action === 'clone' || (action === 'set-to-default' && component.openingId !== subProject.defaultPocketOpening)
      )
    })
    rows.push({ constraint, fields, canAddToExisting: !openingConflict, canConstrainSeparately: fields.length >= 2 })
  }
  return rows
}
