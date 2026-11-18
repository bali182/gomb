import { bindingFieldCompatibility } from '../../data/bindingFieldCompatibility'
import { pocketItems } from '../../data/pocketItems'
import type {
  BindingCompatibilityGroupSchema,
  BindingFieldNameSchema,
  BindingFieldSchema,
  BindingValueSchema,
} from '../../schemas/bindings'
import type { ModelObjectSchema } from '../../schemas/modelObject'
import { PocketItemIdSchema } from '../../schemas/pocketItem'
import type { SubProjectSchema } from '../../schemas/subProject'
import { accessors } from '../../utils/accessors'
import { has } from '../../utils/has'
import { isDefined } from '../../utils/isDefined'
import { narrowers } from '../../utils/narrowers'

export const getBindingFieldValue = (
  model: ModelObjectSchema,
  bindingField: BindingFieldSchema,
): BindingValueSchema => {
  switch (bindingField.type) {
    case 'root-panel-face-binding-field':
      return narrowers.assert.rootPanelFace(model)[bindingField.field]
    case 'root-panel-binding-field':
      return narrowers.assert.rootPanel(model)[bindingField.field]
    case 'panel-binding-field':
      return narrowers.assert.panel(model)[bindingField.field]
    case 'pocket-cluster-binding-field':
      return narrowers.assert.pocketCluster(model)[bindingField.field]
    case 'front-pocket-binding-field':
      return narrowers.assert.frontPocket(model)[bindingField.field]
    case 't-pocket-binding-field':
      return narrowers.assert.tPocket(model)[bindingField.field]
    case 'hole-binding-field':
      if (narrowers.is.hole(model)) {
        return model[bindingField.field]
      }
      throw new Error(`Expected a hole: ${bindingField.modelId}`)
    case 'component-bounds-stitch-line-binding-field':
      return narrowers.assert.componentBoundsStitchLine(model)[bindingField.field]
    case 't-pocket-stitch-line-binding-field':
      return narrowers.assert.tPocketStitchLine(model)[bindingField.field]
    case 'recessed-binding-field':
      if (narrowers.is.pocketOpening(model) && narrowers.is.recessedPocketOpening(model)) {
        return model[bindingField.field]
      }
      throw new Error(`Expected a recessed pocket opening: ${bindingField.modelId}`)
    case 'slanted-binding-field':
      if (narrowers.is.pocketOpening(model) && narrowers.is.slantedPocketOpening(model)) {
        return model[bindingField.field]
      }
      throw new Error(`Expected a slanted pocket opening: ${bindingField.modelId}`)
    case 'optical-illusion-binding-field':
      if (narrowers.is.pocketOpening(model) && narrowers.is.opticalIllusionPocketOpening(model)) {
        return model[bindingField.field]
      }
      throw new Error(`Expected an optical illusion pocket opening: ${bindingField.modelId}`)
  }
}

const isCompatibleValue = (group: BindingCompatibilityGroupSchema, value: BindingValueSchema): boolean => {
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

function assertFieldValue<Model extends ModelObjectSchema, Field extends keyof Model & BindingFieldNameSchema>(
  model: Model,
  field: Field,
  value: BindingValueSchema,
): asserts value is Model[Field] & BindingValueSchema {
  const group: BindingCompatibilityGroupSchema | undefined = bindingFieldCompatibility[model.type][field]
  if (!isDefined(group) || !isCompatibleValue(group, value)) {
    throw new Error(`Incompatible binding value for ${model.type}.${field}`)
  }
}

const setField = <Model extends ModelObjectSchema, Field extends keyof Model & BindingFieldNameSchema>(
  model: Model,
  field: Field,
  value: BindingValueSchema,
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

export const setBindingFieldValue = (
  subProject: SubProjectSchema,
  bindingField: BindingFieldSchema,
  value: BindingValueSchema,
): SubProjectSchema => {
  const model = accessors.subProject(subProject).binding.model(bindingField)
  let updated: ModelObjectSchema
  switch (bindingField.type) {
    case 'root-panel-face-binding-field':
      updated = setField(narrowers.assert.rootPanelFace(model), bindingField.field, value)
      break
    case 'root-panel-binding-field':
      updated = setField(narrowers.assert.rootPanel(model), bindingField.field, value)
      break
    case 'panel-binding-field':
      updated = setField(narrowers.assert.panel(model), bindingField.field, value)
      break
    case 'pocket-cluster-binding-field':
      updated = setField(narrowers.assert.pocketCluster(model), bindingField.field, value)
      break
    case 'front-pocket-binding-field':
      updated = setField(narrowers.assert.frontPocket(model), bindingField.field, value)
      break
    case 't-pocket-binding-field':
      updated = setField(narrowers.assert.tPocket(model), bindingField.field, value)
      break
    case 'hole-binding-field':
      updated = setField(accessors.subProject(subProject).hole.byId(bindingField.modelId), bindingField.field, value)
      break
    case 'component-bounds-stitch-line-binding-field':
      updated = setField(narrowers.assert.componentBoundsStitchLine(model), bindingField.field, value)
      break
    case 't-pocket-stitch-line-binding-field':
      updated = setField(narrowers.assert.tPocketStitchLine(model), bindingField.field, value)
      break
    case 'recessed-binding-field':
      if (!narrowers.is.pocketOpening(model) || !narrowers.is.recessedPocketOpening(model)) {
        throw new Error(`Expected a recessed pocket opening: ${bindingField.modelId}`)
      }
      updated = setField(model, bindingField.field, value)
      break
    case 'slanted-binding-field':
      if (!narrowers.is.pocketOpening(model) || !narrowers.is.slantedPocketOpening(model)) {
        throw new Error(`Expected a slanted pocket opening: ${bindingField.modelId}`)
      }
      updated = setField(model, bindingField.field, value)
      break
    case 'optical-illusion-binding-field':
      if (!narrowers.is.pocketOpening(model) || !narrowers.is.opticalIllusionPocketOpening(model)) {
        throw new Error(`Expected an optical illusion pocket opening: ${bindingField.modelId}`)
      }
      updated = setField(model, bindingField.field, value)
      break
  }
  if (updated === model) {
    return subProject
  }
  return replaceModel(subProject, updated)
}

const replaceModel = (subProject: SubProjectSchema, updated: ModelObjectSchema): SubProjectSchema => {
  switch (updated.type) {
    case 'root-panel-face':
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
  }
}
