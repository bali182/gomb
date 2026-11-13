import { constraintFieldCompatibility } from '../../data/constraintFieldCompatibility'
import { pocketItems } from '../../data/pocketItems'
import type {
  ConstraintCompatibilityGroupSchema,
  ConstraintFieldNameSchema,
  ConstraintFieldSchema,
  ConstraintValueSchema,
} from '../../schemas/constraints'
import type { ModelObjectSchema } from '../../schemas/modelObject'
import { PocketItemIdSchema } from '../../schemas/pocketItem'
import type { SubProjectSchema } from '../../schemas/subProject'
import { accessors } from '../../utils/accessors'
import { has } from '../../utils/has'
import { isDefined } from '../../utils/isDefined'
import { narrowers } from '../../utils/narrowers'

export const getConstraintFieldValue = (
  model: ModelObjectSchema,
  constraintField: ConstraintFieldSchema,
): ConstraintValueSchema => {
  switch (constraintField.type) {
    case 'root-panel-constraint-field':
      return narrowers.assert.rootPanel(model)[constraintField.field]
    case 'panel-constraint-field':
      return narrowers.assert.panel(model)[constraintField.field]
    case 'pocket-cluster-constraint-field':
      return narrowers.assert.pocketCluster(model)[constraintField.field]
    case 'front-pocket-constraint-field':
      return narrowers.assert.frontPocket(model)[constraintField.field]
    case 't-pocket-constraint-field':
      return narrowers.assert.tPocket(model)[constraintField.field]
    case 'hole-constraint-field':
      if (narrowers.is.hole(model)) {
        return model[constraintField.field]
      }
      throw new Error(`Expected a hole: ${constraintField.modelId}`)
    case 'component-bounds-stitch-line-constraint-field':
      return narrowers.assert.componentBoundsStitchLine(model)[constraintField.field]
    case 't-pocket-stitch-line-constraint-field':
      return narrowers.assert.tPocketStitchLine(model)[constraintField.field]
    case 'recessed-constraint-field':
      if (narrowers.is.pocketOpening(model) && narrowers.is.recessedPocketOpening(model)) {
        return model[constraintField.field]
      }
      throw new Error(`Expected a recessed pocket opening: ${constraintField.modelId}`)
    case 'slanted-constraint-field':
      if (narrowers.is.pocketOpening(model) && narrowers.is.slantedPocketOpening(model)) {
        return model[constraintField.field]
      }
      throw new Error(`Expected a slanted pocket opening: ${constraintField.modelId}`)
    case 'optical-illusion-constraint-field':
      if (narrowers.is.pocketOpening(model) && narrowers.is.opticalIllusionPocketOpening(model)) {
        return model[constraintField.field]
      }
      throw new Error(`Expected an optical illusion pocket opening: ${constraintField.modelId}`)
  }
}

const isCompatibleValue = (group: ConstraintCompatibilityGroupSchema, value: ConstraintValueSchema): boolean => {
  switch (group) {
    case 'number':
      return typeof value === 'number'
    case 'string':
    case 'reference:pocket-opening':
      return typeof value === 'string'
    case 'boolean':
      return typeof value === 'boolean'
    case 'reference:component':
      return !isDefined(value) || typeof value === 'string'
    case 'reference:pocket-item':
      return !isDefined(value) || (typeof value === 'string' && has(pocketItems, value as PocketItemIdSchema))
    case 'field:stitch-margin':
    case 'field:stitch-hole-length':
    case 'field:stitch-hole-distance':
    case 'field:stitch-hole-thickness':
    case 'field:stitch-line-thickness':
      return !isDefined(value) || typeof value === 'number'
    case 'enum:anchor':
      return value === 'start' || value === 'middle' || value === 'end'
    case 'enum:layout-orientation':
      return value === 'horizontal' || value === 'vertical'
    case 'enum:pocket-orientation':
      return value === 'up' || value === 'down' || value === 'left' || value === 'right'
    case 'enum:pocket-item-orientation':
      return value === 'landscape' || value === 'portrait'
    case 'enum:pocket-opening-side':
      return value === 'start' || value === 'end'
    case 'enum:stitch-direction':
      return value === 'start-to-end' || value === 'end-to-start'
  }
}

function assertFieldValue<Model extends ModelObjectSchema, Field extends keyof Model & ConstraintFieldNameSchema>(
  model: Model,
  field: Field,
  value: ConstraintValueSchema,
): asserts value is Model[Field] & ConstraintValueSchema {
  const group: ConstraintCompatibilityGroupSchema | undefined = constraintFieldCompatibility[model.type][field]
  if (!isDefined(group) || !isCompatibleValue(group, value)) {
    throw new Error(`Incompatible constraint value for ${model.type}.${field}`)
  }
}

const setField = <Model extends ModelObjectSchema, Field extends keyof Model & ConstraintFieldNameSchema>(
  model: Model,
  field: Field,
  value: ConstraintValueSchema,
): Model => {
  assertFieldValue(model, field, value)
  if (Object.is(model[field], value)) {
    return model
  }
  const updated = { ...model }
  if (isDefined(value)) {
    updated[field] = value
  } else {
    delete updated[field]
  }
  return updated
}

export const setConstraintFieldValue = (
  subProject: SubProjectSchema,
  constraintField: ConstraintFieldSchema,
  value: ConstraintValueSchema,
): SubProjectSchema => {
  const model = accessors.subProject(subProject).constraint.model(constraintField)
  let updated: ModelObjectSchema
  switch (constraintField.type) {
    case 'root-panel-constraint-field':
      updated = setField(narrowers.assert.rootPanel(model), constraintField.field, value)
      break
    case 'panel-constraint-field':
      updated = setField(narrowers.assert.panel(model), constraintField.field, value)
      break
    case 'pocket-cluster-constraint-field':
      updated = setField(narrowers.assert.pocketCluster(model), constraintField.field, value)
      break
    case 'front-pocket-constraint-field':
      updated = setField(narrowers.assert.frontPocket(model), constraintField.field, value)
      break
    case 't-pocket-constraint-field':
      updated = setField(narrowers.assert.tPocket(model), constraintField.field, value)
      break
    case 'hole-constraint-field':
      updated = setField(
        accessors.subProject(subProject).hole.byId(constraintField.modelId),
        constraintField.field,
        value,
      )
      break
    case 'component-bounds-stitch-line-constraint-field':
      updated = setField(narrowers.assert.componentBoundsStitchLine(model), constraintField.field, value)
      break
    case 't-pocket-stitch-line-constraint-field':
      updated = setField(narrowers.assert.tPocketStitchLine(model), constraintField.field, value)
      break
    case 'recessed-constraint-field':
      if (!narrowers.is.pocketOpening(model) || !narrowers.is.recessedPocketOpening(model)) {
        throw new Error(`Expected a recessed pocket opening: ${constraintField.modelId}`)
      }
      updated = setField(model, constraintField.field, value)
      break
    case 'slanted-constraint-field':
      if (!narrowers.is.pocketOpening(model) || !narrowers.is.slantedPocketOpening(model)) {
        throw new Error(`Expected a slanted pocket opening: ${constraintField.modelId}`)
      }
      updated = setField(model, constraintField.field, value)
      break
    case 'optical-illusion-constraint-field':
      if (!narrowers.is.pocketOpening(model) || !narrowers.is.opticalIllusionPocketOpening(model)) {
        throw new Error(`Expected an optical illusion pocket opening: ${constraintField.modelId}`)
      }
      updated = setField(model, constraintField.field, value)
      break
  }
  if (updated === model) {
    return subProject
  }
  return replaceModel(subProject, updated)
}

const replaceModel = (subProject: SubProjectSchema, updated: ModelObjectSchema): SubProjectSchema => {
  switch (updated.type) {
    case 'root-panel':
    case 'panel':
    case 'pocket-cluster':
    case 'front-pocket':
    case 't-pocket':
      return {
        ...subProject,
        components: { ...subProject.components, [updated.id]: updated },
      }
    case 'hole':
      return {
        ...subProject,
        holes: subProject.holes.map((hole) => (hole.id === updated.id ? updated : hole)),
      }
    case 'component-bounds-stitch-line':
    case 't-pocket-stitch-line':
      return {
        ...subProject,
        stitchLines: subProject.stitchLines.map((stitchLine) => (stitchLine.id === updated.id ? updated : stitchLine)),
      }
    case 'straight':
    case 'recessed':
    case 'slanted':
    case 'optical-illusion':
      return {
        ...subProject,
        pocketOpenings: { ...subProject.pocketOpenings, [updated.id]: updated },
      }
    case 'equal-constraint':
      return subProject
  }
}
