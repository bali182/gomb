import { getComponentDescendants } from '../operations/subProject/utils/getComponentDescendants'
import type { ModelObjectSchema } from '../schemas/modelObject'
import type { StitchLineSchema } from '../schemas/stitching'
import type { SubProjectSchema } from '../schemas/subProject'
import { accessors } from '../utils/accessors'
import { isDefined } from '../utils/isDefined'
import { narrowers } from '../utils/narrowers'

type StrokeOpacitySchema = { stroke: number }
type FillStrokeOpacitySchema = StrokeOpacitySchema & { fill: number }

export type SelectionOpacitiesSchema = {
  components: Record<string, FillStrokeOpacitySchema>
  pocketItems: Record<string, FillStrokeOpacitySchema>
  stitchLines: Record<string, StrokeOpacitySchema>
}

export const getSelectionOpacities = (
  selection: ModelObjectSchema | undefined,
  subProject: SubProjectSchema,
  isEditingPocketContents: boolean,
): SelectionOpacitiesSchema => {
  const relatedComponentIds = getRelatedComponentIds(selection, subProject)
  const opacities: SelectionOpacitiesSchema = {
    components: {},
    pocketItems: {},
    stitchLines: {},
  }

  for (const component of Object.values(subProject.components)) {
    const isRelated = !isDefined(selection) || relatedComponentIds.has(component.id)
    const isContentsOwner = isEditingPocketContents && selection?.id === component.id && narrowers.is.pocket(component)
    opacities.components[component.id] = {
      fill: isRelated ? ACTIVE_COMPONENT_FILL_OPACITY : INACTIVE_COMPONENT_FILL_OPACITY,
      stroke: isRelated ? ACTIVE_COMPONENT_STROKE_OPACITY : INACTIVE_COMPONENT_STROKE_OPACITY,
    }
    if (isContentsOwner) {
      opacities.components[component.id].fill = EDITING_POCKET_CONTENTS_FILL_OPACITY
    }

    if (narrowers.is.pocket(component)) {
      const isRelatedItem = !isDefined(selection) || (narrowers.is.component(selection) && isRelated)
      opacities.pocketItems[component.id] = {
        fill: isRelatedItem ? ACTIVE_POCKET_ITEM_FILL_OPACITY : INACTIVE_POCKET_ITEM_FILL_OPACITY,
        stroke: isRelatedItem ? ACTIVE_POCKET_ITEM_STROKE_OPACITY : INACTIVE_POCKET_ITEM_STROKE_OPACITY,
      }
    }
  }

  for (const stitchLine of subProject.stitchLines) {
    const isRelated =
      !isDefined(selection) || isRelatedStitchLine(stitchLine, selection, relatedComponentIds, subProject)
    opacities.stitchLines[stitchLine.id] = {
      stroke: isRelated ? ACTIVE_STITCH_LINE_OPACITY : INACTIVE_STITCH_LINE_OPACITY,
    }
  }

  return opacities
}

const getRelatedComponentIds = (
  selection: ModelObjectSchema | undefined,
  subProject: SubProjectSchema,
): ReadonlySet<string> => {
  if (!isDefined(selection)) {
    return new Set<string>()
  }
  if (narrowers.is.component(selection)) {
    return new Set(
      narrowers.is.pocketCluster(selection) ? getComponentDescendants(selection, subProject) : [selection.id],
    )
  }
  if (narrowers.is.hole(selection)) {
    return new Set([selection.componentId])
  }

  const source = accessors.subProject(subProject)
  if (narrowers.is.componentBoundsStitchLine(selection) && isDefined(selection.onTop)) {
    return new Set([selection.onTop])
  }
  if (selection.targetType === 'component') {
    return new Set([selection.targetId])
  }
  const hole = source.optional.hole(selection.targetId)
  return new Set(isDefined(hole) ? [hole.componentId] : [])
}

const isRelatedStitchLine = (
  stitchLine: StitchLineSchema,
  selection: ModelObjectSchema,
  relatedComponentIds: ReadonlySet<string>,
  subProject: SubProjectSchema,
): boolean => {
  if (narrowers.is.stitchLine(selection)) {
    return selection.id === stitchLine.id
  }
  if (narrowers.is.componentBoundsStitchLine(stitchLine) && isDefined(stitchLine.onTop)) {
    if (relatedComponentIds.has(stitchLine.onTop)) {
      return true
    }
  }
  if (narrowers.is.hole(selection)) {
    return stitchLine.targetType === 'hole' && stitchLine.targetId === selection.id
  }
  if (stitchLine.targetType === 'component') {
    return relatedComponentIds.has(stitchLine.targetId)
  }
  const hole = accessors.subProject(subProject).optional.hole(stitchLine.targetId)
  return isDefined(hole) && relatedComponentIds.has(hole.componentId)
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
