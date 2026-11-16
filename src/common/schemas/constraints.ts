import type { FrontPocketSchema, PanelSchema, PocketClusterSchema, RootPanelSchema, TPocketSchema } from './components'
import type { HoleSchema } from './hole'
import type { ModelObjectSchema, ModelObjectTypeSchema } from './modelObject'
import type {
  OpticalIllusionPocketOpeningSchema,
  RecessedPocketOpeningSchema,
  SlantedPocketOpeningSchema,
} from './pocketOpening'
import type { ComponentBoundsStitchLineSchema, TPocketStitchLineSchema } from './stitching'

type CheckedBindingFieldNameSchema<Model, Field extends keyof Model> = Field

export type RootPanelBindingFieldNameSchema = CheckedBindingFieldNameSchema<
  RootPanelSchema,
  | 'width'
  | 'height'
  | 'topLeftRadius'
  | 'topRightRadius'
  | 'bottomLeftRadius'
  | 'bottomRightRadius'
  | 'layoutOrientation'
  | 'mainAxisAnchor'
  | 'layoutGap'
>

export type PanelBindingFieldNameSchema = CheckedBindingFieldNameSchema<
  PanelSchema,
  | 'width'
  | 'height'
  | 'topLeftRadius'
  | 'topRightRadius'
  | 'bottomLeftRadius'
  | 'bottomRightRadius'
  | 'layoutOrientation'
  | 'mainAxisAnchor'
  | 'layoutGap'
  | 'offAxisAnchor'
  | 'topStretch'
  | 'rightStretch'
  | 'bottomStretch'
  | 'leftStretch'
>

export type PocketClusterBindingFieldNameSchema = CheckedBindingFieldNameSchema<
  PocketClusterSchema,
  | 'width'
  | 'height'
  | 'topLeftRadius'
  | 'topRightRadius'
  | 'bottomLeftRadius'
  | 'bottomRightRadius'
  | 'topStretch'
  | 'rightStretch'
  | 'bottomStretch'
  | 'leftStretch'
  | 'offAxisAnchor'
  | 'pocketStep'
  | 'orientation'
>

export type FrontPocketBindingFieldNameSchema = CheckedBindingFieldNameSchema<
  FrontPocketSchema,
  | 'topLeftRadius'
  | 'topRightRadius'
  | 'bottomLeftRadius'
  | 'bottomRightRadius'
  | 'layoutOrientation'
  | 'mainAxisAnchor'
  | 'layoutGap'
  | 'openingId'
  | 'itemId'
  | 'itemOrientation'
  | 'itemCrossAxisOffset'
  | 'itemOpeningOffset'
>

export type TPocketBindingFieldNameSchema = CheckedBindingFieldNameSchema<
  TPocketSchema,
  | 'tPocketTabWidth'
  | 'tPocketTaper'
  | 'openingId'
  | 'itemId'
  | 'itemOrientation'
  | 'itemCrossAxisOffset'
  | 'itemOpeningOffset'
>

export type HoleBindingFieldNameSchema = CheckedBindingFieldNameSchema<
  HoleSchema,
  | 'width'
  | 'height'
  | 'topLeftRadius'
  | 'topRightRadius'
  | 'bottomLeftRadius'
  | 'bottomRightRadius'
  | 'xAnchor'
  | 'yAnchor'
  | 'xOffset'
  | 'yOffset'
>

export type RecessedPocketOpeningBindingFieldNameSchema = CheckedBindingFieldNameSchema<
  RecessedPocketOpeningSchema,
  'recessOuterInset' | 'recessInnerOffset' | 'recessOuterRadius' | 'recessInnerRadius' | 'recessDepth'
>

export type SlantedPocketOpeningBindingFieldNameSchema = CheckedBindingFieldNameSchema<
  SlantedPocketOpeningSchema,
  'slantOffset' | 'slantSide'
>

export type OpticalIllusionPocketOpeningBindingFieldNameSchema = CheckedBindingFieldNameSchema<
  OpticalIllusionPocketOpeningSchema,
  'illusionSide' | 'illusionStartInset' | 'illusionEndInset' | 'illusionLeadingRadius' | 'illusionTrailingRadius'
>

export type ComponentBoundsStitchLineBindingFieldNameSchema = CheckedBindingFieldNameSchema<
  ComponentBoundsStitchLineSchema,
  | 'startOffset'
  | 'endOffset'
  | 'stitchDirection'
  | 'stitchMargin'
  | 'stitchHoleLength'
  | 'stitchHoleDistance'
  | 'stitchHoleThickness'
  | 'stitchLineThickness'
  | 'topLeftRadius'
  | 'topRightRadius'
  | 'bottomLeftRadius'
  | 'bottomRightRadius'
  | 'onTop'
>

export type TPocketStitchLineBindingFieldNameSchema = CheckedBindingFieldNameSchema<
  TPocketStitchLineSchema,
  | 'stitchMargin'
  | 'stitchHoleLength'
  | 'stitchHoleDistance'
  | 'stitchHoleThickness'
  | 'stitchLineThickness'
  | 'startOffset'
  | 'endOffset'
  | 'stitchDirection'
>

export type BindingFieldNameSchema =
  | RootPanelBindingFieldNameSchema
  | PanelBindingFieldNameSchema
  | PocketClusterBindingFieldNameSchema
  | FrontPocketBindingFieldNameSchema
  | TPocketBindingFieldNameSchema
  | HoleBindingFieldNameSchema
  | RecessedPocketOpeningBindingFieldNameSchema
  | SlantedPocketOpeningBindingFieldNameSchema
  | OpticalIllusionPocketOpeningBindingFieldNameSchema
  | ComponentBoundsStitchLineBindingFieldNameSchema
  | TPocketStitchLineBindingFieldNameSchema

export type RootPanelBindingFieldSchema = {
  id: string
  type: 'root-panel-constraint-field'
  modelId: string
  field: RootPanelBindingFieldNameSchema
}

export type PanelBindingFieldSchema = {
  id: string
  type: 'panel-constraint-field'
  modelId: string
  field: PanelBindingFieldNameSchema
}

export type PocketClusterBindingFieldSchema = {
  id: string
  type: 'pocket-cluster-constraint-field'
  modelId: string
  field: PocketClusterBindingFieldNameSchema
}

export type FrontPocketBindingFieldSchema = {
  id: string
  type: 'front-pocket-constraint-field'
  modelId: string
  field: FrontPocketBindingFieldNameSchema
}

export type TPocketBindingFieldSchema = {
  id: string
  type: 't-pocket-constraint-field'
  modelId: string
  field: TPocketBindingFieldNameSchema
}

export type HoleBindingFieldSchema = {
  id: string
  type: 'hole-constraint-field'
  modelId: string
  field: HoleBindingFieldNameSchema
}

export type RecessedPocketOpeningBindingFieldSchema = {
  id: string
  type: 'recessed-constraint-field'
  modelId: string
  field: RecessedPocketOpeningBindingFieldNameSchema
}

export type SlantedPocketOpeningBindingFieldSchema = {
  id: string
  type: 'slanted-constraint-field'
  modelId: string
  field: SlantedPocketOpeningBindingFieldNameSchema
}

export type OpticalIllusionPocketOpeningBindingFieldSchema = {
  id: string
  type: 'optical-illusion-constraint-field'
  modelId: string
  field: OpticalIllusionPocketOpeningBindingFieldNameSchema
}

export type ComponentBoundsStitchLineBindingFieldSchema = {
  id: string
  type: 'component-bounds-stitch-line-constraint-field'
  modelId: string
  field: ComponentBoundsStitchLineBindingFieldNameSchema
}

export type TPocketStitchLineBindingFieldSchema = {
  id: string
  type: 't-pocket-stitch-line-constraint-field'
  modelId: string
  field: TPocketStitchLineBindingFieldNameSchema
}

export type BindingFieldSchema =
  | RootPanelBindingFieldSchema
  | PanelBindingFieldSchema
  | PocketClusterBindingFieldSchema
  | FrontPocketBindingFieldSchema
  | TPocketBindingFieldSchema
  | HoleBindingFieldSchema
  | RecessedPocketOpeningBindingFieldSchema
  | SlantedPocketOpeningBindingFieldSchema
  | OpticalIllusionPocketOpeningBindingFieldSchema
  | ComponentBoundsStitchLineBindingFieldSchema
  | TPocketStitchLineBindingFieldSchema

export type EqualBindingSchema = {
  id: string
  type: 'equal-constraint'
  fields: BindingFieldSchema[]
}

export type BindingSchema = EqualBindingSchema

export type BindingValueSchema = string | number | boolean | undefined

export type BindingCompatibilityGroupSchema =
  // Loose types
  | 'string'
  | 'number'
  | 'boolean'
  // Enum values
  | 'enum:layout-orientation'
  | 'enum:anchor'
  | 'enum:pocket-orientation'
  | 'enum:pocket-item-orientation'
  | 'enum:pocket-opening-side'
  | 'enum:stitch-direction'
  // References
  | 'reference:pocket-opening'
  | 'reference:pocket-item'
  | 'reference:component'
  // Exact fields
  | 'field:stitch-margin'
  | 'field:stitch-hole-length'
  | 'field:stitch-hole-distance'
  | 'field:stitch-hole-thickness'
  | 'field:stitch-line-thickness'

export type ModelBindingFieldCompatibilitySchema<Fields extends BindingFieldNameSchema = BindingFieldNameSchema> =
  Readonly<Partial<Record<Fields, BindingCompatibilityGroupSchema>>>

export type BindingFieldCompatibilityDefinitionsSchema = {
  'root-panel': ModelBindingFieldCompatibilitySchema<RootPanelBindingFieldNameSchema>
  'panel': ModelBindingFieldCompatibilitySchema<PanelBindingFieldNameSchema>
  'pocket-cluster': ModelBindingFieldCompatibilitySchema<PocketClusterBindingFieldNameSchema>
  'front-pocket': ModelBindingFieldCompatibilitySchema<FrontPocketBindingFieldNameSchema>
  't-pocket': ModelBindingFieldCompatibilitySchema<TPocketBindingFieldNameSchema>
  'hole': ModelBindingFieldCompatibilitySchema<HoleBindingFieldNameSchema>
  'straight': Record<string, never>
  'recessed': ModelBindingFieldCompatibilitySchema<RecessedPocketOpeningBindingFieldNameSchema>
  'slanted': ModelBindingFieldCompatibilitySchema<SlantedPocketOpeningBindingFieldNameSchema>
  'optical-illusion': ModelBindingFieldCompatibilitySchema<OpticalIllusionPocketOpeningBindingFieldNameSchema>
  'component-bounds-stitch-line': ModelBindingFieldCompatibilitySchema<ComponentBoundsStitchLineBindingFieldNameSchema>
  't-pocket-stitch-line': ModelBindingFieldCompatibilitySchema<TPocketStitchLineBindingFieldNameSchema>
}

export type BindingFieldCompatibilitySchema = Readonly<
  Record<ModelObjectTypeSchema, ModelBindingFieldCompatibilitySchema>
>

export type BindingFieldBlockReasonSchema = 'auto-width' | 'auto-height' | 'auto-layout-gap' | 'auto-corner-radius'

export type BindingFieldBlockerSchema = (model: ModelObjectSchema) => BindingFieldBlockReasonSchema | undefined

export type ModelBindingFieldBlockersSchema<Fields extends BindingFieldNameSchema = BindingFieldNameSchema> = Readonly<
  Partial<Record<Fields, BindingFieldBlockerSchema>>
>

export type BindingFieldBlockerDefinitionsSchema = {
  'root-panel': ModelBindingFieldBlockersSchema<RootPanelBindingFieldNameSchema>
  'panel': ModelBindingFieldBlockersSchema<PanelBindingFieldNameSchema>
  'pocket-cluster': ModelBindingFieldBlockersSchema<PocketClusterBindingFieldNameSchema>
  'front-pocket': ModelBindingFieldBlockersSchema<FrontPocketBindingFieldNameSchema>
  't-pocket': ModelBindingFieldBlockersSchema<TPocketBindingFieldNameSchema>
  'hole': ModelBindingFieldBlockersSchema<HoleBindingFieldNameSchema>
  'straight': Record<string, never>
  'recessed': ModelBindingFieldBlockersSchema<RecessedPocketOpeningBindingFieldNameSchema>
  'slanted': ModelBindingFieldBlockersSchema<SlantedPocketOpeningBindingFieldNameSchema>
  'optical-illusion': ModelBindingFieldBlockersSchema<OpticalIllusionPocketOpeningBindingFieldNameSchema>
  'component-bounds-stitch-line': ModelBindingFieldBlockersSchema<ComponentBoundsStitchLineBindingFieldNameSchema>
  't-pocket-stitch-line': ModelBindingFieldBlockersSchema<TPocketStitchLineBindingFieldNameSchema>
}

export type BindingFieldBlockersSchema = Readonly<Record<ModelObjectTypeSchema, ModelBindingFieldBlockersSchema>>
