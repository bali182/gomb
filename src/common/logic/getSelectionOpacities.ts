import type { SubProjectAccessorSchema } from '../schemas/accessors'
import type { ComponentSchema } from '../schemas/components'
import type { StitchLineSchema } from '../schemas/stitching'
import type { SubProjectItemSchema, SubProjectSchema } from '../schemas/subProject'
import { accessors } from '../utils/accessors'
import { isDefined } from '../utils/isDefined'
import { narrowers } from '../utils/narrowers'
import {
  normalizeStitchLineEntryAndExit,
  type NormalizedStitchLineEntryAndExit,
} from './stitching/stitchLineComponentValidation'

type StrokeOpacitySchema = { stroke: number }
type FillStrokeOpacitySchema = StrokeOpacitySchema & { fill: number }

export type SelectionOpacitiesSchema = {
  components: Record<string, FillStrokeOpacitySchema>
  pocketItems: Record<string, FillStrokeOpacitySchema>
  stitchLines: Record<string, StrokeOpacitySchema>
}

export const getSelectionOpacities = (
  selection: SubProjectItemSchema | undefined,
  subProject: SubProjectSchema,
  isEditingPocketContents: boolean,
): SelectionOpacitiesSchema => {
  const accessor = accessors.subProject(subProject)
  const relatedComponentIds = getRelatedComponentIds(selection, subProject, accessor)
  const hasSelection =
    isDefined(selection) &&
    selection.type !== 'equal-binding' &&
    (!narrowers.is.pocketOpening(selection) || relatedComponentIds.size > 0)
  const opacities: SelectionOpacitiesSchema = {
    components: {},
    pocketItems: {},
    stitchLines: {},
  }

  for (const component of Object.values(subProject.components)) {
    const isRelated = !hasSelection || relatedComponentIds.has(component.id)
    const isContentsOwner =
      isEditingPocketContents &&
      isDefined(selection) &&
      narrowers.is.pocket(selection) &&
      selection.id === component.id &&
      narrowers.is.pocket(component)
    opacities.components[component.id] = {
      fill: isRelated ? ACTIVE_COMPONENT_FILL_OPACITY : INACTIVE_COMPONENT_FILL_OPACITY,
      stroke: isRelated ? ACTIVE_COMPONENT_STROKE_OPACITY : INACTIVE_COMPONENT_STROKE_OPACITY,
    }
    if (isContentsOwner) {
      opacities.components[component.id].fill = EDITING_POCKET_CONTENTS_FILL_OPACITY
    }

    if (narrowers.is.pocket(component)) {
      const isRelatedItem =
        !hasSelection ||
        (isDefined(selection) &&
          (narrowers.is.component(selection) || narrowers.is.pocketOpening(selection)) &&
          isRelated)
      opacities.pocketItems[component.id] = {
        fill: isRelatedItem ? ACTIVE_POCKET_ITEM_FILL_OPACITY : INACTIVE_POCKET_ITEM_FILL_OPACITY,
        stroke: isRelatedItem ? ACTIVE_POCKET_ITEM_STROKE_OPACITY : INACTIVE_POCKET_ITEM_STROKE_OPACITY,
      }
    }
  }

  for (const stitchLine of subProject.stitchLines) {
    const isRelated =
      !hasSelection ||
      (isDefined(selection) && isRelatedStitchLine(stitchLine, selection, relatedComponentIds, accessor))
    opacities.stitchLines[stitchLine.id] = {
      stroke: isRelated ? ACTIVE_STITCH_LINE_OPACITY : INACTIVE_STITCH_LINE_OPACITY,
    }
  }

  return opacities
}

const getRelatedComponentIds = (
  selection: SubProjectItemSchema | undefined,
  subProject: SubProjectSchema,
  accessor: SubProjectAccessorSchema,
): ReadonlySet<string> => {
  if (!isDefined(selection)) {
    return new Set<string>()
  }
  switch (selection.type) {
    case 'equal-binding':
      return new Set<string>()
    case 'straight':
    case 'slanted':
    case 'recessed':
    case 'optical-illusion':
      return new Set(
        Object.values(subProject.components)
          .filter(
            (component: ComponentSchema): boolean =>
              narrowers.is.pocket(component) && component.openingId === selection.id,
          )
          .map((component: ComponentSchema): string => component.id),
      )
    case 'root-panel-face':
      return new Set([selection.id, subProject.root])
    case 'root-panel':
    case 'panel':
    case 'front-pocket':
    case 't-pocket':
      return new Set([selection.id])
    case 'guide':
    case 'pocket-cluster':
      return new Set(accessor.component.descendantIds(selection.id, true))
    case 'hole':
      return new Set([selection.componentId])
    case 'component-bounds-stitch-line':
    case 't-pocket-stitch-line': {
      return getStitchLineEntryAndExitComponentIds(selection, accessor)
    }
  }
}

const isRelatedStitchLine = (
  stitchLine: StitchLineSchema,
  selection: SubProjectItemSchema,
  relatedComponentIds: ReadonlySet<string>,
  accessor: SubProjectAccessorSchema,
): boolean => {
  if (narrowers.is.stitchLine(selection)) {
    return selection.id === stitchLine.id
  }
  if (narrowers.is.hole(selection)) {
    return stitchLine.targetType === 'hole' && stitchLine.targetId === selection.id
  }
  if ([...getStitchLineEntryAndExitComponentIds(stitchLine, accessor)].some((id) => relatedComponentIds.has(id))) {
    return true
  }
  if (stitchLine.targetType === 'component') {
    return relatedComponentIds.has(stitchLine.targetId)
  }
  const ownerId = accessor.optional.hole.byId(stitchLine.targetId)?.componentId
  return isDefined(ownerId) && relatedComponentIds.has(ownerId)
}

const getStitchLineEntryAndExitComponentIds = (
  stitchLine: StitchLineSchema,
  accessor: SubProjectAccessorSchema,
): Set<string> => {
  if (narrowers.is.tPocketStitchLine(stitchLine)) {
    const cluster = accessor.optional.stitchLine.ownerPocketCluster(stitchLine.id)
    if (isDefined(cluster) && cluster.id === stitchLine.targetId) {
      const ids = accessor.component
        .children(cluster.id)
        .filter(narrowers.is.tPocket)
        .flatMap((pocket) => {
          const entryAndExit = normalizeStitchLineEntryAndExit(stitchLine.id, accessor, pocket.id)
          return [...getEntryAndExitComponentIds(entryAndExit, accessor)]
        })
      return new Set(ids)
    }
  }
  const entryAndExit = normalizeStitchLineEntryAndExit(stitchLine.id, accessor)
  return getEntryAndExitComponentIds(entryAndExit, accessor)
}

const getEntryAndExitComponentIds = (
  entryAndExit: NormalizedStitchLineEntryAndExit | undefined,
  accessor: SubProjectAccessorSchema,
): Set<string> => {
  if (!isDefined(entryAndExit)) {
    return new Set<string>()
  }
  const { entryComponent, exitComponent } = entryAndExit
  const ids = new Set([entryComponent.id, exitComponent.id])
  if (narrowers.is.rootPanelFace(entryComponent) || narrowers.is.rootPanelFace(exitComponent)) {
    ids.add(accessor.component.rootPanel().id)
  }
  return ids
}

const ACTIVE_COMPONENT_FILL_OPACITY = 1
const ACTIVE_COMPONENT_STROKE_OPACITY = 1
const INACTIVE_COMPONENT_FILL_OPACITY = 0.0
const INACTIVE_COMPONENT_STROKE_OPACITY = 0.3

const ACTIVE_POCKET_ITEM_FILL_OPACITY = 1
const ACTIVE_POCKET_ITEM_STROKE_OPACITY = 1
const INACTIVE_POCKET_ITEM_FILL_OPACITY = 0.0
const INACTIVE_POCKET_ITEM_STROKE_OPACITY = 0.0

const ACTIVE_STITCH_LINE_OPACITY = 1
const INACTIVE_STITCH_LINE_OPACITY = 0.3

const EDITING_POCKET_CONTENTS_FILL_OPACITY = 0.4
