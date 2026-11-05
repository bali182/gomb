import type { FrontPocketSchema, PanelSchema, PocketClusterSchema, RootPanelSchema, TPocketSchema } from './components'
import type { HoleSchema } from './hole'
import type { ModelObjectSchema, ModelObjectTypeSchema } from './modelObject'
import type {
  OpticalIllusionPocketOpeningSchema,
  RecessedPocketOpeningSchema,
  SlantedPocketOpeningSchema,
} from './pocketOpening'
import type { ComponentBoundsStitchLineSchema, TPocketStitchLineSchema } from './stitching'

type CheckedConstraintFieldNameSchema<Model, Field extends keyof Model> = Field

export type RootPanelConstraintFieldNameSchema = CheckedConstraintFieldNameSchema<
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

export type PanelConstraintFieldNameSchema = CheckedConstraintFieldNameSchema<
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

export type PocketClusterConstraintFieldNameSchema = CheckedConstraintFieldNameSchema<
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

export type FrontPocketConstraintFieldNameSchema = CheckedConstraintFieldNameSchema<
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

export type TPocketConstraintFieldNameSchema = CheckedConstraintFieldNameSchema<
  TPocketSchema,
  | 'tPocketTabWidth'
  | 'tPocketTaper'
  | 'openingId'
  | 'itemId'
  | 'itemOrientation'
  | 'itemCrossAxisOffset'
  | 'itemOpeningOffset'
>

export type HoleConstraintFieldNameSchema = CheckedConstraintFieldNameSchema<
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

export type RecessedPocketOpeningConstraintFieldNameSchema = CheckedConstraintFieldNameSchema<
  RecessedPocketOpeningSchema,
  'outerInset' | 'innerOffset' | 'outerRadius' | 'innerRadius' | 'depth'
>

export type SlantedPocketOpeningConstraintFieldNameSchema = CheckedConstraintFieldNameSchema<
  SlantedPocketOpeningSchema,
  'offset' | 'side'
>

export type OpticalIllusionPocketOpeningConstraintFieldNameSchema = CheckedConstraintFieldNameSchema<
  OpticalIllusionPocketOpeningSchema,
  'direction' | 'startInset' | 'endInset' | 'leadingRadius' | 'trailingRadius'
>

export type ComponentBoundsStitchLineConstraintFieldNameSchema = CheckedConstraintFieldNameSchema<
  ComponentBoundsStitchLineSchema,
  | 'stitchMargin'
  | 'stitchHoleLength'
  | 'stitchHoleDistance'
  | 'stitchHoleThickness'
  | 'stitchLineThickness'
  | 'topStartOffset'
  | 'topEndOffset'
  | 'rightStartOffset'
  | 'rightEndOffset'
  | 'bottomStartOffset'
  | 'bottomEndOffset'
  | 'leftStartOffset'
  | 'leftEndOffset'
  | 'topLeftRadius'
  | 'topRightRadius'
  | 'bottomLeftRadius'
  | 'bottomRightRadius'
  | 'top'
  | 'right'
  | 'bottom'
  | 'left'
  | 'topLeftCorner'
  | 'topRightCorner'
  | 'bottomRightCorner'
  | 'bottomLeftCorner'
  | 'stitchDisconnectedTopLeftCorner'
  | 'stitchDisconnectedTopRightCorner'
  | 'stitchDisconnectedBottomLeftCorner'
  | 'stitchDisconnectedBottomRightCorner'
  | 'topStitchDirection'
  | 'bottomStitchDirection'
  | 'rightStitchDirection'
  | 'leftStitchDirection'
  | 'onTop'
>

export type TPocketStitchLineConstraintFieldNameSchema = CheckedConstraintFieldNameSchema<
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

export type ConstraintFieldNameSchema =
  | RootPanelConstraintFieldNameSchema
  | PanelConstraintFieldNameSchema
  | PocketClusterConstraintFieldNameSchema
  | FrontPocketConstraintFieldNameSchema
  | TPocketConstraintFieldNameSchema
  | HoleConstraintFieldNameSchema
  | RecessedPocketOpeningConstraintFieldNameSchema
  | SlantedPocketOpeningConstraintFieldNameSchema
  | OpticalIllusionPocketOpeningConstraintFieldNameSchema
  | ComponentBoundsStitchLineConstraintFieldNameSchema
  | TPocketStitchLineConstraintFieldNameSchema

export type RootPanelConstraintFieldSchema = {
  id: string
  type: 'root-panel-constraint-field'
  modelId: string
  field: RootPanelConstraintFieldNameSchema
}

export type PanelConstraintFieldSchema = {
  id: string
  type: 'panel-constraint-field'
  modelId: string
  field: PanelConstraintFieldNameSchema
}

export type PocketClusterConstraintFieldSchema = {
  id: string
  type: 'pocket-cluster-constraint-field'
  modelId: string
  field: PocketClusterConstraintFieldNameSchema
}

export type FrontPocketConstraintFieldSchema = {
  id: string
  type: 'front-pocket-constraint-field'
  modelId: string
  field: FrontPocketConstraintFieldNameSchema
}

export type TPocketConstraintFieldSchema = {
  id: string
  type: 't-pocket-constraint-field'
  modelId: string
  field: TPocketConstraintFieldNameSchema
}

export type HoleConstraintFieldSchema = {
  id: string
  type: 'hole-constraint-field'
  modelId: string
  field: HoleConstraintFieldNameSchema
}

export type RecessedPocketOpeningConstraintFieldSchema = {
  id: string
  type: 'recessed-constraint-field'
  modelId: string
  field: RecessedPocketOpeningConstraintFieldNameSchema
}

export type SlantedPocketOpeningConstraintFieldSchema = {
  id: string
  type: 'slanted-constraint-field'
  modelId: string
  field: SlantedPocketOpeningConstraintFieldNameSchema
}

export type OpticalIllusionPocketOpeningConstraintFieldSchema = {
  id: string
  type: 'optical-illusion-constraint-field'
  modelId: string
  field: OpticalIllusionPocketOpeningConstraintFieldNameSchema
}

export type ComponentBoundsStitchLineConstraintFieldSchema = {
  id: string
  type: 'component-bounds-stitch-line-constraint-field'
  modelId: string
  field: ComponentBoundsStitchLineConstraintFieldNameSchema
}

export type TPocketStitchLineConstraintFieldSchema = {
  id: string
  type: 't-pocket-stitch-line-constraint-field'
  modelId: string
  field: TPocketStitchLineConstraintFieldNameSchema
}

export type ConstraintFieldSchema =
  | RootPanelConstraintFieldSchema
  | PanelConstraintFieldSchema
  | PocketClusterConstraintFieldSchema
  | FrontPocketConstraintFieldSchema
  | TPocketConstraintFieldSchema
  | HoleConstraintFieldSchema
  | RecessedPocketOpeningConstraintFieldSchema
  | SlantedPocketOpeningConstraintFieldSchema
  | OpticalIllusionPocketOpeningConstraintFieldSchema
  | ComponentBoundsStitchLineConstraintFieldSchema
  | TPocketStitchLineConstraintFieldSchema

export type EqualConstraintSchema = {
  id: string
  type: 'equal-constraint'
  fields: ConstraintFieldSchema[]
}

export type ConstraintSchema = EqualConstraintSchema

export type ConstraintCompatibilityGroupSchema =
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
  | 'enum:horizontal-stitch-direction'
  | 'enum:vertical-stitch-direction'
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

export type ModelConstraintFieldCompatibilitySchema<
  Fields extends ConstraintFieldNameSchema = ConstraintFieldNameSchema,
> = Readonly<Partial<Record<Fields, ConstraintCompatibilityGroupSchema>>>

export type ConstraintFieldCompatibilityDefinitionsSchema = {
  constraint: Record<string, never>
  'root-panel': ModelConstraintFieldCompatibilitySchema<RootPanelConstraintFieldNameSchema>
  'panel': ModelConstraintFieldCompatibilitySchema<PanelConstraintFieldNameSchema>
  'pocket-cluster': ModelConstraintFieldCompatibilitySchema<PocketClusterConstraintFieldNameSchema>
  'front-pocket': ModelConstraintFieldCompatibilitySchema<FrontPocketConstraintFieldNameSchema>
  't-pocket': ModelConstraintFieldCompatibilitySchema<TPocketConstraintFieldNameSchema>
  'hole': ModelConstraintFieldCompatibilitySchema<HoleConstraintFieldNameSchema>
  'straight': Record<string, never>
  'recessed': ModelConstraintFieldCompatibilitySchema<RecessedPocketOpeningConstraintFieldNameSchema>
  'slanted': ModelConstraintFieldCompatibilitySchema<SlantedPocketOpeningConstraintFieldNameSchema>
  'optical-illusion': ModelConstraintFieldCompatibilitySchema<OpticalIllusionPocketOpeningConstraintFieldNameSchema>
  'component-bounds-stitch-line': ModelConstraintFieldCompatibilitySchema<ComponentBoundsStitchLineConstraintFieldNameSchema>
  't-pocket-stitch-line': ModelConstraintFieldCompatibilitySchema<TPocketStitchLineConstraintFieldNameSchema>
}

export type ConstraintFieldCompatibilitySchema = Readonly<
  Record<ModelObjectTypeSchema, ModelConstraintFieldCompatibilitySchema>
>

export type ConstraintFieldBlockReasonSchema = 'auto-width' | 'auto-height' | 'auto-layout-gap' | 'auto-corner-radius'

export type ConstraintFieldBlockerSchema = (model: ModelObjectSchema) => ConstraintFieldBlockReasonSchema | undefined

export type ModelConstraintFieldBlockersSchema<Fields extends ConstraintFieldNameSchema = ConstraintFieldNameSchema> =
  Readonly<Partial<Record<Fields, ConstraintFieldBlockerSchema>>>

export type ConstraintFieldBlockerDefinitionsSchema = {
  constraint: Record<string, never>
  'root-panel': ModelConstraintFieldBlockersSchema<RootPanelConstraintFieldNameSchema>
  'panel': ModelConstraintFieldBlockersSchema<PanelConstraintFieldNameSchema>
  'pocket-cluster': ModelConstraintFieldBlockersSchema<PocketClusterConstraintFieldNameSchema>
  'front-pocket': ModelConstraintFieldBlockersSchema<FrontPocketConstraintFieldNameSchema>
  't-pocket': ModelConstraintFieldBlockersSchema<TPocketConstraintFieldNameSchema>
  'hole': ModelConstraintFieldBlockersSchema<HoleConstraintFieldNameSchema>
  'straight': Record<string, never>
  'recessed': ModelConstraintFieldBlockersSchema<RecessedPocketOpeningConstraintFieldNameSchema>
  'slanted': ModelConstraintFieldBlockersSchema<SlantedPocketOpeningConstraintFieldNameSchema>
  'optical-illusion': ModelConstraintFieldBlockersSchema<OpticalIllusionPocketOpeningConstraintFieldNameSchema>
  'component-bounds-stitch-line': ModelConstraintFieldBlockersSchema<ComponentBoundsStitchLineConstraintFieldNameSchema>
  't-pocket-stitch-line': ModelConstraintFieldBlockersSchema<TPocketStitchLineConstraintFieldNameSchema>
}

export type ConstraintFieldBlockersSchema = Readonly<Record<ModelObjectTypeSchema, ModelConstraintFieldBlockersSchema>>
