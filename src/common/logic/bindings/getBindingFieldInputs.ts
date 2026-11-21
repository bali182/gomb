import type {
  ComponentBoundsStitchLineBindingFieldNameSchema,
  FrontPocketBindingFieldNameSchema,
  HoleBindingFieldNameSchema,
  OpticalIllusionPocketOpeningBindingFieldNameSchema,
  PanelBindingFieldNameSchema,
  PocketClusterBindingFieldNameSchema,
  RecessedPocketOpeningBindingFieldNameSchema,
  RootPanelBindingFieldNameSchema,
  RootPanelFaceBindingFieldNameSchema,
  SlantedPocketOpeningBindingFieldNameSchema,
  TPocketBindingFieldNameSchema,
  TPocketStitchLineBindingFieldNameSchema,
} from '../../schemas/bindings'
import type {
  BindingFieldInputSchema,
  ComponentBoundsStitchLineBindingFieldInputSchema,
  FrontPocketBindingFieldInputSchema,
  HoleBindingFieldInputSchema,
  OpticalIllusionPocketOpeningBindingFieldInputSchema,
  PanelBindingFieldInputSchema,
  PocketClusterBindingFieldInputSchema,
  RecessedPocketOpeningBindingFieldInputSchema,
  RootPanelBindingFieldInputSchema,
  RootPanelFaceBindingFieldInputSchema,
  SlantedPocketOpeningBindingFieldInputSchema,
  TPocketBindingFieldInputSchema,
  TPocketStitchLineBindingFieldInputSchema,
} from '../../schemas/factory'
import type { ModelObjectSchema } from '../../schemas/modelObject'

export const getBindingFieldInputs = (model: ModelObjectSchema): BindingFieldInputSchema[] => {
  switch (model.type) {
    case 'root-panel-face': {
      const fields: RootPanelFaceBindingFieldNameSchema[] = ['layoutOrientation', 'mainAxisAnchor', 'layoutGap']
      return fields.map(
        (field): RootPanelFaceBindingFieldInputSchema => ({
          type: 'root-panel-face-binding-field',
          modelId: model.id,
          field,
        }),
      )
    }
    case 'root-panel': {
      const fields: RootPanelBindingFieldNameSchema[] = [
        'width',
        'height',
        'topLeftRadius',
        'topRightRadius',
        'bottomLeftRadius',
        'bottomRightRadius',
      ]
      return fields.map(
        (field): RootPanelBindingFieldInputSchema => ({
          type: 'root-panel-binding-field',
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
        (field): PanelBindingFieldInputSchema => ({ type: 'panel-binding-field', modelId: model.id, field }),
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
        (field): PocketClusterBindingFieldInputSchema => ({
          type: 'pocket-cluster-binding-field',
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
        (field): FrontPocketBindingFieldInputSchema => ({
          type: 'front-pocket-binding-field',
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
        (field): TPocketBindingFieldInputSchema => ({ type: 't-pocket-binding-field', modelId: model.id, field }),
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
        (field): HoleBindingFieldInputSchema => ({ type: 'hole-binding-field', modelId: model.id, field }),
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
        (field): RecessedPocketOpeningBindingFieldInputSchema => ({
          type: 'recessed-binding-field',
          modelId: model.id,
          field,
        }),
      )
    }
    case 'slanted': {
      const fields: SlantedPocketOpeningBindingFieldNameSchema[] = ['slantOffset', 'slantSide']
      return fields.map(
        (field): SlantedPocketOpeningBindingFieldInputSchema => ({
          type: 'slanted-binding-field',
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
        (field): OpticalIllusionPocketOpeningBindingFieldInputSchema => ({
          type: 'optical-illusion-binding-field',
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
      ]
      return fields.map(
        (field): ComponentBoundsStitchLineBindingFieldInputSchema => ({
          type: 'component-bounds-stitch-line-binding-field',
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
        (field): TPocketStitchLineBindingFieldInputSchema => ({
          type: 't-pocket-stitch-line-binding-field',
          modelId: model.id,
          field,
        }),
      )
    }
    case 'straight':
      return []
  }
}
