import type {
  ComponentBoundsStitchLineConstraintFieldNameSchema,
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
