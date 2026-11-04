import type { ConstraintSchema } from '../schemas/constraints'
import type { ComputedSubProjectSchema, SubProjectSchema } from '../schemas/subProject'
import { accessors } from '../utils/accessors'
import { isDefined } from '../utils/isDefined'

export const deleteOrphanedConstraintFields = (
  subProject: SubProjectSchema,
  _computedSubProject: ComputedSubProjectSchema,
): SubProjectSchema => {
  const accessor = accessors.subProject(subProject)
  const constraints: Record<string, ConstraintSchema> = {}
  let hasChanged = false

  for (const [id, constraint] of Object.entries(subProject.constraints)) {
    const fields = constraint.fields.filter((field) => {
      switch (field.type) {
        case 'root-panel-constraint-field':
          return isDefined(accessor.optional.component.rootPanel(field.modelId))
        case 'panel-constraint-field':
          return isDefined(accessor.optional.component.panel(field.modelId))
        case 'pocket-cluster-constraint-field':
          return isDefined(accessor.optional.component.pocketCluster(field.modelId))
        case 'front-pocket-constraint-field':
          return isDefined(accessor.optional.component.frontPocket(field.modelId))
        case 't-pocket-constraint-field':
          return isDefined(accessor.optional.component.tPocket(field.modelId))
        case 'hole-constraint-field':
          return isDefined(accessor.optional.hole.byId(field.modelId))
        case 'component-bounds-stitch-line-constraint-field':
          return isDefined(accessor.optional.stitchLine.bounds(field.modelId))
        case 't-pocket-stitch-line-constraint-field':
          return isDefined(accessor.optional.stitchLine.tPocket(field.modelId))
        case 'recessed-constraint-field':
          return accessor.optional.pocketOpening.byId(field.modelId)?.type === 'recessed'
        case 'slanted-constraint-field':
          return accessor.optional.pocketOpening.byId(field.modelId)?.type === 'slanted'
        case 'optical-illusion-constraint-field':
          return accessor.optional.pocketOpening.byId(field.modelId)?.type === 'optical-illusion'
      }
    })

    if (fields.length < 2) {
      hasChanged = true
      continue
    }
    if (fields.length !== constraint.fields.length) {
      constraints[id] = { ...constraint, fields }
      hasChanged = true
    } else {
      constraints[id] = constraint
    }
  }

  return hasChanged ? { ...subProject, constraints } : subProject
}
