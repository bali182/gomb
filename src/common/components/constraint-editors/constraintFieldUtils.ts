import type {
  ComponentBoundsStitchLineConstraintFieldNameSchema,
  ConstraintFieldNameSchema,
  ConstraintSchema,
  FrontPocketConstraintFieldNameSchema,
  HoleConstraintFieldNameSchema,
  OpticalIllusionPocketOpeningConstraintFieldNameSchema,
  PanelConstraintFieldNameSchema,
  PocketClusterConstraintFieldNameSchema,
  RecessedPocketOpeningConstraintFieldNameSchema,
  RootPanelConstraintFieldNameSchema,
  SlantedPocketOpeningConstraintFieldNameSchema,
  TPocketConstraintFieldNameSchema,
  TPocketStitchLineConstraintFieldNameSchema,
} from '../../schemas/constraints'
import type {
  ComponentBoundsStitchLineConstraintFieldInputSchema,
  ConstraintFieldInputSchema,
  FrontPocketConstraintFieldInputSchema,
  HoleConstraintFieldInputSchema,
  OpticalIllusionPocketOpeningConstraintFieldInputSchema,
  PanelConstraintFieldInputSchema,
  PocketClusterConstraintFieldInputSchema,
  RecessedPocketOpeningConstraintFieldInputSchema,
  RootPanelConstraintFieldInputSchema,
  SlantedPocketOpeningConstraintFieldInputSchema,
  TPocketConstraintFieldInputSchema,
  TPocketStitchLineConstraintFieldInputSchema,
} from '../../schemas/factory'
import type { ModelObjectSchema } from '../../schemas/modelObject'
import type { SubProjectSchema } from '../../schemas/subProject'
import type { TranslationSchema } from '../../translations/translationSchema'
import { accessors } from '../../utils/accessors'
import { isDefined } from '../../utils/isDefined'
import { narrowers } from '../../utils/narrowers'

export type ConstraintFieldAdderState = {
  modelIds: string[]
  property: ConstraintFieldNameSchema | undefined
}

export const getConstraintFieldInputs = (model: ModelObjectSchema): ConstraintFieldInputSchema[] => {
  switch (model.type) {
    case 'root-panel': {
      const fields: RootPanelConstraintFieldNameSchema[] = [
        'width',
        'height',
        'topLeftRadius',
        'topRightRadius',
        'bottomLeftRadius',
        'bottomRightRadius',
        'layoutOrientation',
        'mainAxisAnchor',
        'layoutGap',
      ]
      return fields.map(
        (field): RootPanelConstraintFieldInputSchema => ({
          type: 'root-panel-constraint-field',
          modelId: model.id,
          field,
        }),
      )
    }
    case 'panel': {
      const fields: PanelConstraintFieldNameSchema[] = [
        'width',
        'height',
        'topLeftRadius',
        'topRightRadius',
        'bottomLeftRadius',
        'bottomRightRadius',
        'layoutOrientation',
        'mainAxisAnchor',
        'layoutGap',
        'offAxisAnchor',
        'topStretch',
        'rightStretch',
        'bottomStretch',
        'leftStretch',
      ]
      return fields.map(
        (field): PanelConstraintFieldInputSchema => ({ type: 'panel-constraint-field', modelId: model.id, field }),
      )
    }
    case 'pocket-cluster': {
      const fields: PocketClusterConstraintFieldNameSchema[] = [
        'width',
        'height',
        'topLeftRadius',
        'topRightRadius',
        'bottomLeftRadius',
        'bottomRightRadius',
        'topStretch',
        'rightStretch',
        'bottomStretch',
        'leftStretch',
        'offAxisAnchor',
        'pocketStep',
        'orientation',
      ]
      return fields.map(
        (field): PocketClusterConstraintFieldInputSchema => ({
          type: 'pocket-cluster-constraint-field',
          modelId: model.id,
          field,
        }),
      )
    }
    case 'front-pocket': {
      const fields: FrontPocketConstraintFieldNameSchema[] = [
        'topLeftRadius',
        'topRightRadius',
        'bottomLeftRadius',
        'bottomRightRadius',
        'layoutOrientation',
        'mainAxisAnchor',
        'layoutGap',
        'openingId',
        'itemId',
        'itemOrientation',
        'itemCrossAxisOffset',
        'itemOpeningOffset',
      ]
      return fields.map(
        (field): FrontPocketConstraintFieldInputSchema => ({
          type: 'front-pocket-constraint-field',
          modelId: model.id,
          field,
        }),
      )
    }
    case 't-pocket': {
      const fields: TPocketConstraintFieldNameSchema[] = [
        'tPocketTabWidth',
        'tPocketTaper',
        'openingId',
        'itemId',
        'itemOrientation',
        'itemCrossAxisOffset',
        'itemOpeningOffset',
      ]
      return fields.map(
        (field): TPocketConstraintFieldInputSchema => ({ type: 't-pocket-constraint-field', modelId: model.id, field }),
      )
    }
    case 'hole': {
      const fields: HoleConstraintFieldNameSchema[] = [
        'width',
        'height',
        'topLeftRadius',
        'topRightRadius',
        'bottomLeftRadius',
        'bottomRightRadius',
        'xAnchor',
        'yAnchor',
        'xOffset',
        'yOffset',
      ]
      return fields.map(
        (field): HoleConstraintFieldInputSchema => ({ type: 'hole-constraint-field', modelId: model.id, field }),
      )
    }
    case 'recessed': {
      const fields: RecessedPocketOpeningConstraintFieldNameSchema[] = [
        'outerInset',
        'innerOffset',
        'outerRadius',
        'innerRadius',
        'depth',
      ]
      return fields.map(
        (field): RecessedPocketOpeningConstraintFieldInputSchema => ({
          type: 'recessed-constraint-field',
          modelId: model.id,
          field,
        }),
      )
    }
    case 'slanted': {
      const fields: SlantedPocketOpeningConstraintFieldNameSchema[] = ['offset', 'side']
      return fields.map(
        (field): SlantedPocketOpeningConstraintFieldInputSchema => ({
          type: 'slanted-constraint-field',
          modelId: model.id,
          field,
        }),
      )
    }
    case 'optical-illusion': {
      const fields: OpticalIllusionPocketOpeningConstraintFieldNameSchema[] = [
        'direction',
        'startInset',
        'endInset',
        'leadingRadius',
        'trailingRadius',
      ]
      return fields.map(
        (field): OpticalIllusionPocketOpeningConstraintFieldInputSchema => ({
          type: 'optical-illusion-constraint-field',
          modelId: model.id,
          field,
        }),
      )
    }
    case 'component-bounds-stitch-line': {
      const fields: ComponentBoundsStitchLineConstraintFieldNameSchema[] = [
        'startOffset',
        'endOffset',
        'stitchDirection',
        'stitchMargin',
        'stitchHoleLength',
        'stitchHoleDistance',
        'stitchHoleThickness',
        'stitchLineThickness',
        'topLeftRadius',
        'topRightRadius',
        'bottomLeftRadius',
        'bottomRightRadius',
        'onTop',
      ]
      return fields.map(
        (field): ComponentBoundsStitchLineConstraintFieldInputSchema => ({
          type: 'component-bounds-stitch-line-constraint-field',
          modelId: model.id,
          field,
        }),
      )
    }
    case 't-pocket-stitch-line': {
      const fields: TPocketStitchLineConstraintFieldNameSchema[] = [
        'stitchMargin',
        'stitchHoleLength',
        'stitchHoleDistance',
        'stitchHoleThickness',
        'stitchLineThickness',
        'startOffset',
        'endOffset',
        'stitchDirection',
      ]
      return fields.map(
        (field): TPocketStitchLineConstraintFieldInputSchema => ({
          type: 't-pocket-stitch-line-constraint-field',
          modelId: model.id,
          field,
        }),
      )
    }
    case 'straight':
    case 'equal-constraint':
      return []
  }
}

export const getConstraintFieldLabel = (field: ConstraintFieldNameSchema, t: TranslationSchema): string => {
  const labels: Record<ConstraintFieldNameSchema, string> = {
    width: t.project.editors.sections.common.size.width.label,
    height: t.project.editors.sections.common.size.height.label,
    topLeftRadius: t.project.editors.sections.common.cornerRadius.topLeftRadius.label,
    topRightRadius: t.project.editors.sections.common.cornerRadius.topRightRadius.label,
    bottomLeftRadius: t.project.editors.sections.common.cornerRadius.bottomLeftRadius.label,
    bottomRightRadius: t.project.editors.sections.common.cornerRadius.bottomRightRadius.label,
    layoutOrientation: t.project.editors.sections.components.layout.layoutOrientation.label,
    mainAxisAnchor: t.project.editors.sections.components.layout.mainAxisAnchor.label,
    layoutGap: t.project.editors.sections.components.layout.layoutGap.label,
    offAxisAnchor: t.project.editors.sections.components.anchor.offAxisAnchor.label,
    topStretch: t.project.editors.sections.components.stretch.topStretch.label,
    rightStretch: t.project.editors.sections.components.stretch.rightStretch.label,
    bottomStretch: t.project.editors.sections.components.stretch.bottomStretch.label,
    leftStretch: t.project.editors.sections.components.stretch.leftStretch.label,
    pocketStep: t.project.editors.sections.components.pockets.pocketStep.label,
    orientation: t.project.editors.sections.components.pockets.orientation.label,
    openingId: t.project.editors.sections.components.pocketOpening.title,
    itemId: t.project.editors.sections.components.contents.itemId.label,
    itemOrientation: t.project.editors.sections.components.contents.itemOrientation.label,
    itemCrossAxisOffset: t.project.editors.sections.components.contents.itemCrossAxisOffset.label,
    itemOpeningOffset: t.project.editors.sections.components.contents.itemOpeningOffset.label,
    tPocketTabWidth: t.project.editors.sections.components.tPocket.tPocketTabWidth.label,
    tPocketTaper: t.project.editors.sections.components.tPocket.tPocketTaper.label,
    xAnchor: t.project.editors.sections.holes.position.xAnchor.label,
    yAnchor: t.project.editors.sections.holes.position.yAnchor.label,
    xOffset: t.project.editors.sections.holes.position.xOffset.label,
    yOffset: t.project.editors.sections.holes.position.yOffset.label,
    outerInset: t.project.editors.sections.components.recessedPocketOpening.geometry.outerInset.label,
    innerOffset: t.project.editors.sections.components.recessedPocketOpening.geometry.innerOffset.label,
    outerRadius: t.project.editors.sections.components.recessedPocketOpening.cornerRadius.outerRadius.label,
    innerRadius: t.project.editors.sections.components.recessedPocketOpening.cornerRadius.innerRadius.label,
    depth: t.project.editors.sections.components.recessedPocketOpening.geometry.depth.label,
    offset: t.project.editors.sections.components.slantedPocketOpening.geometry.offset.label,
    side: t.project.editors.sections.components.slantedPocketOpening.geometry.side.label,
    direction: t.project.editors.sections.components.opticalIllusionPocketOpening.geometry.direction.label,
    startInset: t.project.editors.sections.components.opticalIllusionPocketOpening.geometry.startInset.label,
    endInset: t.project.editors.sections.components.opticalIllusionPocketOpening.geometry.endInset.label,
    leadingRadius: t.project.editors.sections.components.opticalIllusionPocketOpening.cornerRadius.leadingRadius.label,
    trailingRadius:
      t.project.editors.sections.components.opticalIllusionPocketOpening.cornerRadius.trailingRadius.label,
    stitchMargin: t.project.editors.sections.stitchLines.settings.stitchMargin.label,
    stitchHoleLength: t.project.editors.sections.stitchLines.settings.stitchHoleLength.label,
    stitchHoleDistance: t.project.editors.sections.stitchLines.settings.stitchHoleDistance.label,
    stitchHoleThickness: t.project.editors.sections.stitchLines.settings.stitchHoleThickness.label,
    stitchLineThickness: t.project.editors.sections.stitchLines.settings.stitchLineThickness.label,
    onTop: t.project.editors.sections.stitchLines.renderTarget.onTop.label,
    startOffset: t.project.editors.sections.stitchLines.pocketStitching.startOffset.label,
    endOffset: t.project.editors.sections.stitchLines.pocketStitching.endOffset.label,
    stitchDirection: t.project.editors.sections.stitchLines.pocketStitching.stitchDirection.label,
  }
  return labels[field]
}

export const getConstraintLabel = (constraint: ConstraintSchema, t: TranslationSchema): string => {
  if (constraint.fields.length === 0) {
    return t.project.editors.sections.constraints.empty
  }

  const counts = new Map<ConstraintFieldNameSchema, number>()
  for (const field of constraint.fields) {
    counts.set(field.field, (counts.get(field.field) ?? 0) + 1)
  }

  return Array.from(counts, ([field, count]) => {
    const label = getConstraintFieldLabel(field, t)
    return count > 1 ? `${label} (${count})` : label
  }).join(', ')
}

export const getConstraintModelPath = (model: ModelObjectSchema, subProject: SubProjectSchema): ModelObjectSchema[] => {
  const accessor = accessors.subProject(subProject)
  if (narrowers.is.constraint(model)) {
    return []
  }
  if (narrowers.is.pocketOpening(model)) {
    return [model]
  }
  if (narrowers.is.hole(model)) {
    return [...getConstraintModelPath(accessor.component.byId(model.componentId), subProject), model]
  }
  if (narrowers.is.stitchLine(model)) {
    const target =
      model.targetType === 'component' ? accessor.component.byId(model.targetId) : accessor.hole.byId(model.targetId)
    return [...getConstraintModelPath(target, subProject), model]
  }
  const path: ModelObjectSchema[] = [model]
  let parent = accessor.optional.component.parent(model.id)
  while (isDefined(parent)) {
    path.unshift(parent)
    parent = accessor.optional.component.parent(parent.id)
  }
  return path
}
