import type {
  ComponentBoundsStitchLineBindingFieldNameSchema,
  FrontPocketBindingFieldNameSchema,
  HoleBindingFieldNameSchema,
  OpticalIllusionPocketOpeningBindingFieldNameSchema,
  PanelBindingFieldNameSchema,
  PocketClusterBindingFieldNameSchema,
  RecessedPocketOpeningBindingFieldNameSchema,
  RootPanelBindingFieldNameSchema,
  SlantedPocketOpeningBindingFieldNameSchema,
  TPocketBindingFieldNameSchema,
  TPocketStitchLineBindingFieldNameSchema,
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
      const fields: RootPanelBindingFieldNameSchema[] = [
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
      const fields: PanelBindingFieldNameSchema[] = [
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
      const fields: PocketClusterBindingFieldNameSchema[] = [
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
      const fields: FrontPocketBindingFieldNameSchema[] = [
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
      const fields: TPocketBindingFieldNameSchema[] = [
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
      const fields: HoleBindingFieldNameSchema[] = [
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
      const fields: RecessedPocketOpeningBindingFieldNameSchema[] = [
        'recessOuterInset',
        'recessInnerOffset',
        'recessOuterRadius',
        'recessInnerRadius',
        'recessDepth',
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
      const fields: SlantedPocketOpeningBindingFieldNameSchema[] = ['slantOffset', 'slantSide']
      return fields.map(
        (field): SlantedPocketOpeningConstraintFieldInputSchema => ({
          type: 'slanted-constraint-field',
          modelId: model.id,
          field,
        }),
      )
    }
    case 'optical-illusion': {
      const fields: OpticalIllusionPocketOpeningBindingFieldNameSchema[] = [
        'illusionSide',
        'illusionStartInset',
        'illusionEndInset',
        'illusionLeadingRadius',
        'illusionTrailingRadius',
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
      const fields: ComponentBoundsStitchLineBindingFieldNameSchema[] = [
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
      const fields: TPocketStitchLineBindingFieldNameSchema[] = [
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
      return []
  }
}
