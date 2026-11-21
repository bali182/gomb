import type { SubProjectAccessorSchema } from '../../schemas/accessors'
import type { ComponentSchema } from '../../schemas/components'
import { isDefined } from '../../utils/isDefined'
import { narrowers } from '../../utils/narrowers'

export type NormalizedStitchLineEntryAndExit = {
  entryComponent: ComponentSchema
  exitComponent: ComponentSchema
  entryComponentValid: boolean
  exitComponentValid: boolean
}

export const normalizeStitchLineEntryAndExit = (
  stitchLineId: string,
  accessor: SubProjectAccessorSchema,
  pocketId?: string,
): NormalizedStitchLineEntryAndExit | undefined => {
  const stitchLine = accessor.optional.stitchLine.byId(stitchLineId)
  const defaultEntryId = accessor.optional.stitchLine.defaultEntryComponentId(stitchLineId, pocketId)
  const defaultExitId = accessor.optional.stitchLine.defaultExitComponentId(stitchLineId)
  const defaultEntry = isDefined(defaultEntryId) ? accessor.optional.component.byId(defaultEntryId) : undefined
  const defaultExit = isDefined(defaultExitId) ? accessor.optional.component.byId(defaultExitId) : undefined
  if (!isDefined(stitchLine) || !isDefined(defaultEntry) || !isDefined(defaultExit)) {
    return undefined
  }
  const entryComponentValid =
    !narrowers.is.componentBoundsStitchLine(stitchLine) ||
    !isDefined(stitchLine.entryComponentId) ||
    isStitchLineEntryComponentAllowed(stitchLineId, stitchLine.entryComponentId, accessor)
  const entryComponent = entryComponentValid
    ? accessor.optional.stitchLine.entryComponent(stitchLineId, pocketId)
    : defaultEntry
  if (!isDefined(entryComponent)) {
    return undefined
  }
  const exitComponentValid =
    !isDefined(stitchLine.exitComponentId) ||
    isStitchLineExitComponentAllowed(stitchLineId, entryComponent.id, stitchLine.exitComponentId, accessor)
  const exitComponent = exitComponentValid ? accessor.optional.stitchLine.exitComponent(stitchLineId) : defaultExit
  if (!isDefined(exitComponent)) {
    return undefined
  }
  return { entryComponent, exitComponent, entryComponentValid, exitComponentValid }
}

export const isStitchLineEntryComponentAllowed = (
  stitchLineId: string,
  componentId: string,
  accessor: SubProjectAccessorSchema,
): boolean => {
  const stitchLine = accessor.optional.stitchLine.bounds(stitchLineId)
  const component = accessor.optional.component.byId(componentId)
  const defaultId = accessor.optional.stitchLine.defaultEntryComponentId(stitchLineId)
  if (!isDefined(stitchLine) || !isDefined(component) || !isDefined(defaultId)) {
    return false
  }
  if (narrowers.is.rootPanel(component) || narrowers.is.pocketCluster(component)) {
    return false
  }
  const ownFace = accessor.optional.component.rootPanelFaceOf(defaultId)
  const candidateFace = accessor.optional.component.rootPanelFaceOf(component.id)
  return isDefined(ownFace) && ownFace.id === candidateFace?.id
}

export const isStitchLineExitComponentAllowed = (
  stitchLineId: string,
  entryComponentId: string | undefined,
  componentId: string,
  accessor: SubProjectAccessorSchema,
): boolean => {
  const stitchLine = accessor.optional.stitchLine.byId(stitchLineId)
  const entry = isDefined(entryComponentId) ? accessor.optional.component.byId(entryComponentId) : undefined
  const exit = accessor.optional.component.byId(componentId)
  if (!isDefined(stitchLine) || !isDefined(exit)) {
    return false
  }
  if (narrowers.is.rootPanel(exit) || narrowers.is.pocketCluster(exit)) {
    return false
  }
  const cluster = narrowers.is.tPocketStitchLine(stitchLine)
    ? accessor.optional.stitchLine.ownerPocketCluster(stitchLineId)
    : undefined
  const originId = cluster?.id ?? entry?.id
  const face = isDefined(originId) ? accessor.optional.component.rootPanelFaceOf(originId) : undefined
  if (!isDefined(face) || (narrowers.is.rootPanelFace(exit) && exit.id === face.id)) {
    return false
  }
  const root = accessor.component.rootPanel()
  const layers = accessor.component.layerIds(face.id)
  const exitLayerId = narrowers.is.rootPanelFace(exit) ? root.id : exit.id
  const exitIndex = layers.indexOf(exitLayerId)
  if (exitIndex < 0) {
    return false
  }
  if (narrowers.is.tPocketStitchLine(stitchLine)) {
    const defaultExitId = accessor.optional.stitchLine.defaultExitComponentId(stitchLineId)
    const defaultExit = isDefined(defaultExitId) ? accessor.optional.component.byId(defaultExitId) : undefined
    if (!isDefined(defaultExit)) {
      return false
    }
    const minimumLayerId = narrowers.is.rootPanelFace(defaultExit) ? root.id : defaultExit.id
    const minimumIndex = layers.indexOf(minimumLayerId)
    return minimumIndex >= 0 && exitIndex <= minimumIndex
  }
  if (!isDefined(entry)) {
    return false
  }
  const entryLayerId = narrowers.is.rootPanelFace(entry) ? root.id : entry.id
  const entryIndex = layers.indexOf(entryLayerId)
  return entryIndex >= 0 && exitIndex <= entryIndex
}
