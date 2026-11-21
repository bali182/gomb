import type {
  BindingFieldSchema,
  BindingSchema,
  ComponentBoundsStitchLineBindingFieldSchema,
  EqualBindingSchema,
  FrontPocketBindingFieldSchema,
  HoleBindingFieldSchema,
  OpticalIllusionPocketOpeningBindingFieldSchema,
  PanelBindingFieldSchema,
  PocketClusterBindingFieldSchema,
  RecessedPocketOpeningBindingFieldSchema,
  RootPanelBindingFieldSchema,
  RootPanelFaceBindingFieldNameSchema,
  RootPanelFaceBindingFieldSchema,
  SlantedPocketOpeningBindingFieldSchema,
  TPocketBindingFieldSchema,
  TPocketStitchLineBindingFieldSchema,
} from './bindings'
import type { HasComponentReferenceSchema, HasComponentTargetSchema, HasName, HasTargetSchema } from './common'
import type {
  ComponentSchema,
  FrontPocketSchema,
  HasColorSchema,
  PanelSchema,
  PocketClusterSchema,
  RootPanelFaceSchema,
  RootPanelSchema,
  TPocketSchema,
} from './components'
import type { HoleSchema } from './hole'
import type {
  OpticalIllusionPocketOpeningSchema,
  PocketOpeningSchema,
  RecessedPocketOpeningSchema,
  SlantedPocketOpeningSchema,
  StraightPocketOpeningSchema,
} from './pocketOpening'
import type {
  ComponentBoundsStitchLineSchema,
  StitchLineCommonConfigSchema,
  StitchLineSchema,
  TPocketStitchLineSchema,
} from './stitching'

export type HasForbiddenIdsSchema = {
  forbiddenIds: Set<string>
}

export type HasForbiddenNamesSchema = {
  forbiddenNames: Set<string>
}

export type HasReadonlyForbiddenIdsSchema = {
  forbiddenIds?: ReadonlySet<string>
}

export type HasReadonlyForbiddenNamesSchema = {
  forbiddenNames?: ReadonlySet<string>
}

export type HasStitchingSettingsSchema = {
  stitchingSettings: StitchLineCommonConfigSchema
}

export type ReadonlyCreateComponentParamsSchema = HasReadonlyForbiddenIdsSchema &
  HasReadonlyForbiddenNamesSchema &
  HasColorSchema &
  HasStitchingSettingsSchema & {
    type: ComponentSchema['type']
    name?: string
    frontFaceId?: string
    backFaceId?: string
    openingId?: string
  }
export type ReadonlyCreateRootPanelParamsSchema = HasReadonlyForbiddenIdsSchema &
  HasReadonlyForbiddenNamesSchema &
  HasStitchingSettingsSchema &
  HasColorSchema & {
    frontFaceId: string
    backFaceId: string
  }

export type ReadonlyCreateRootPanelFaceParamsSchema = HasReadonlyForbiddenIdsSchema &
  HasReadonlyForbiddenNamesSchema &
  HasName

export type ReadonlyCreatePanelParamsSchema = HasReadonlyForbiddenIdsSchema &
  HasReadonlyForbiddenNamesSchema &
  HasColorSchema
export type ReadonlyCreatePocketClusterParamsSchema = HasReadonlyForbiddenIdsSchema &
  HasReadonlyForbiddenNamesSchema &
  HasColorSchema &
  HasStitchingSettingsSchema
export type ReadonlyCreatePocketParamsSchema = HasReadonlyForbiddenIdsSchema &
  HasReadonlyForbiddenNamesSchema &
  HasColorSchema & {
    openingId: string
  }
export type ReadonlyCreateHoleParamsSchema = HasReadonlyForbiddenIdsSchema &
  HasReadonlyForbiddenNamesSchema &
  HasComponentReferenceSchema
export type ReadonlyCreateStitchLineParamsSchema = HasReadonlyForbiddenIdsSchema &
  HasReadonlyForbiddenNamesSchema &
  HasTargetSchema & {
    type: StitchLineSchema['type']
  }
export type ReadonlyCreateComponentBoundsStitchLineParamsSchema = HasReadonlyForbiddenIdsSchema &
  HasReadonlyForbiddenNamesSchema &
  HasTargetSchema
export type ReadonlyCreateTPocketStitchLineParamsSchema = HasReadonlyForbiddenIdsSchema &
  HasReadonlyForbiddenNamesSchema &
  HasComponentTargetSchema
export type ReadonlyCreatePocketOpeningParamsSchema = HasReadonlyForbiddenIdsSchema &
  HasReadonlyForbiddenNamesSchema & {
    type: PocketOpeningSchema['type']
  }
export type ReadonlyCreateBindingParamsSchema = HasReadonlyForbiddenIdsSchema & {
  type: BindingSchema['type']
}

export type RootPanelBindingFieldInputSchema = Omit<RootPanelBindingFieldSchema, 'id'>

export type RootPanelFaceBindingFieldInputSchema = {
  type: 'root-panel-face-binding-field'
  modelId: string
  field: RootPanelFaceBindingFieldNameSchema
}

export type PanelBindingFieldInputSchema = Omit<PanelBindingFieldSchema, 'id'>

export type PocketClusterBindingFieldInputSchema = Omit<PocketClusterBindingFieldSchema, 'id'>

export type FrontPocketBindingFieldInputSchema = Omit<FrontPocketBindingFieldSchema, 'id'>

export type TPocketBindingFieldInputSchema = Omit<TPocketBindingFieldSchema, 'id'>

export type HoleBindingFieldInputSchema = Omit<HoleBindingFieldSchema, 'id'>

export type RecessedPocketOpeningBindingFieldInputSchema = Omit<RecessedPocketOpeningBindingFieldSchema, 'id'>

export type SlantedPocketOpeningBindingFieldInputSchema = Omit<SlantedPocketOpeningBindingFieldSchema, 'id'>

export type OpticalIllusionPocketOpeningBindingFieldInputSchema = Omit<
  OpticalIllusionPocketOpeningBindingFieldSchema,
  'id'
>

export type ComponentBoundsStitchLineBindingFieldInputSchema = Omit<ComponentBoundsStitchLineBindingFieldSchema, 'id'>

export type TPocketStitchLineBindingFieldInputSchema = Omit<TPocketStitchLineBindingFieldSchema, 'id'>

export type BindingFieldInputSchema =
  | RootPanelBindingFieldInputSchema
  | RootPanelFaceBindingFieldInputSchema
  | PanelBindingFieldInputSchema
  | PocketClusterBindingFieldInputSchema
  | FrontPocketBindingFieldInputSchema
  | TPocketBindingFieldInputSchema
  | HoleBindingFieldInputSchema
  | RecessedPocketOpeningBindingFieldInputSchema
  | SlantedPocketOpeningBindingFieldInputSchema
  | OpticalIllusionPocketOpeningBindingFieldInputSchema
  | ComponentBoundsStitchLineBindingFieldInputSchema
  | TPocketStitchLineBindingFieldInputSchema

export type ReadonlyCreateBindingFieldParamsSchema = HasReadonlyForbiddenIdsSchema & BindingFieldInputSchema

export type ReadonlyCreateRootPanelBindingFieldParamsSchema = HasReadonlyForbiddenIdsSchema &
  RootPanelBindingFieldInputSchema

export type ReadonlyCreateRootPanelFaceBindingFieldParamsSchema = HasReadonlyForbiddenIdsSchema &
  RootPanelFaceBindingFieldInputSchema

export type ReadonlyCreatePanelBindingFieldParamsSchema = HasReadonlyForbiddenIdsSchema & PanelBindingFieldInputSchema

export type ReadonlyCreatePocketClusterBindingFieldParamsSchema = HasReadonlyForbiddenIdsSchema &
  PocketClusterBindingFieldInputSchema

export type ReadonlyCreateFrontPocketBindingFieldParamsSchema = HasReadonlyForbiddenIdsSchema &
  FrontPocketBindingFieldInputSchema

export type ReadonlyCreateTPocketBindingFieldParamsSchema = HasReadonlyForbiddenIdsSchema &
  TPocketBindingFieldInputSchema

export type ReadonlyCreateHoleBindingFieldParamsSchema = HasReadonlyForbiddenIdsSchema & HoleBindingFieldInputSchema

export type ReadonlyCreateRecessedPocketOpeningBindingFieldParamsSchema = HasReadonlyForbiddenIdsSchema &
  RecessedPocketOpeningBindingFieldInputSchema

export type ReadonlyCreateSlantedPocketOpeningBindingFieldParamsSchema = HasReadonlyForbiddenIdsSchema &
  SlantedPocketOpeningBindingFieldInputSchema

export type ReadonlyCreateOpticalIllusionPocketOpeningBindingFieldParamsSchema = HasReadonlyForbiddenIdsSchema &
  OpticalIllusionPocketOpeningBindingFieldInputSchema

export type ReadonlyCreateComponentBoundsStitchLineBindingFieldParamsSchema = HasReadonlyForbiddenIdsSchema &
  ComponentBoundsStitchLineBindingFieldInputSchema

export type ReadonlyCreateTPocketStitchLineBindingFieldParamsSchema = HasReadonlyForbiddenIdsSchema &
  TPocketStitchLineBindingFieldInputSchema

export type ReadonlyCreateFrontPocketParamsSchema = ReadonlyCreatePocketParamsSchema

export type ReadonlyCreateTPocketParamsSchema = ReadonlyCreatePocketParamsSchema

export type ReadonlyCreateStraightPocketOpeningParamsSchema = HasReadonlyForbiddenIdsSchema &
  HasReadonlyForbiddenNamesSchema

export type ReadonlyCreateRecessedPocketOpeningParamsSchema = HasReadonlyForbiddenIdsSchema &
  HasReadonlyForbiddenNamesSchema

export type ReadonlyCreateSlantedPocketOpeningParamsSchema = HasReadonlyForbiddenIdsSchema &
  HasReadonlyForbiddenNamesSchema

export type ReadonlyCreateOpticalIllusionPocketOpeningParamsSchema = HasReadonlyForbiddenIdsSchema &
  HasReadonlyForbiddenNamesSchema

export type ReadonlyCreateEqualBindingParamsSchema = HasReadonlyForbiddenIdsSchema

export type CreateComponentParamsSchema = ReadonlyCreateComponentParamsSchema &
  HasForbiddenIdsSchema &
  HasForbiddenNamesSchema

export type CreateRootPanelParamsSchema = ReadonlyCreateRootPanelParamsSchema &
  HasForbiddenIdsSchema &
  HasForbiddenNamesSchema

export type CreateRootPanelFaceParamsSchema = HasForbiddenIdsSchema & HasForbiddenNamesSchema & HasName

export type CreatePanelParamsSchema = ReadonlyCreatePanelParamsSchema & HasForbiddenIdsSchema & HasForbiddenNamesSchema

export type CreatePocketClusterParamsSchema = ReadonlyCreatePocketClusterParamsSchema &
  HasForbiddenIdsSchema &
  HasForbiddenNamesSchema

export type CreatePocketParamsSchema = ReadonlyCreatePocketParamsSchema &
  HasForbiddenIdsSchema &
  HasForbiddenNamesSchema

export type CreateHoleParamsSchema = ReadonlyCreateHoleParamsSchema & HasForbiddenIdsSchema & HasForbiddenNamesSchema

export type CreateStitchLineParamsSchema = ReadonlyCreateStitchLineParamsSchema &
  HasForbiddenIdsSchema &
  HasForbiddenNamesSchema

export type CreateComponentBoundsStitchLineParamsSchema = ReadonlyCreateComponentBoundsStitchLineParamsSchema &
  HasForbiddenIdsSchema &
  HasForbiddenNamesSchema

export type CreateTPocketStitchLineParamsSchema = ReadonlyCreateTPocketStitchLineParamsSchema &
  HasForbiddenIdsSchema &
  HasForbiddenNamesSchema

export type CreatePocketOpeningParamsSchema = ReadonlyCreatePocketOpeningParamsSchema &
  HasForbiddenIdsSchema &
  HasForbiddenNamesSchema

export type CreateBindingParamsSchema = ReadonlyCreateBindingParamsSchema & HasForbiddenIdsSchema

export type CreateBindingFieldParamsSchema = ReadonlyCreateBindingFieldParamsSchema & HasForbiddenIdsSchema

export type CreateRootPanelBindingFieldParamsSchema = ReadonlyCreateRootPanelBindingFieldParamsSchema &
  HasForbiddenIdsSchema

export type CreateRootPanelFaceBindingFieldParamsSchema = HasForbiddenIdsSchema & RootPanelFaceBindingFieldInputSchema

export type CreatePanelBindingFieldParamsSchema = ReadonlyCreatePanelBindingFieldParamsSchema & HasForbiddenIdsSchema

export type CreatePocketClusterBindingFieldParamsSchema = ReadonlyCreatePocketClusterBindingFieldParamsSchema &
  HasForbiddenIdsSchema

export type CreateFrontPocketBindingFieldParamsSchema = ReadonlyCreateFrontPocketBindingFieldParamsSchema &
  HasForbiddenIdsSchema

export type CreateTPocketBindingFieldParamsSchema = ReadonlyCreateTPocketBindingFieldParamsSchema &
  HasForbiddenIdsSchema

export type CreateHoleBindingFieldParamsSchema = ReadonlyCreateHoleBindingFieldParamsSchema & HasForbiddenIdsSchema

export type CreateRecessedPocketOpeningBindingFieldParamsSchema =
  ReadonlyCreateRecessedPocketOpeningBindingFieldParamsSchema & HasForbiddenIdsSchema

export type CreateSlantedPocketOpeningBindingFieldParamsSchema =
  ReadonlyCreateSlantedPocketOpeningBindingFieldParamsSchema & HasForbiddenIdsSchema

export type CreateOpticalIllusionPocketOpeningBindingFieldParamsSchema =
  ReadonlyCreateOpticalIllusionPocketOpeningBindingFieldParamsSchema & HasForbiddenIdsSchema

export type CreateComponentBoundsStitchLineBindingFieldParamsSchema =
  ReadonlyCreateComponentBoundsStitchLineBindingFieldParamsSchema & HasForbiddenIdsSchema

export type CreateTPocketStitchLineBindingFieldParamsSchema = ReadonlyCreateTPocketStitchLineBindingFieldParamsSchema &
  HasForbiddenIdsSchema

export type CreateFrontPocketParamsSchema = ReadonlyCreateFrontPocketParamsSchema &
  HasForbiddenIdsSchema &
  HasForbiddenNamesSchema

export type CreateTPocketParamsSchema = ReadonlyCreateTPocketParamsSchema &
  HasForbiddenIdsSchema &
  HasForbiddenNamesSchema

export type CreateStraightPocketOpeningParamsSchema = ReadonlyCreateStraightPocketOpeningParamsSchema &
  HasForbiddenIdsSchema &
  HasForbiddenNamesSchema

export type CreateRecessedPocketOpeningParamsSchema = ReadonlyCreateRecessedPocketOpeningParamsSchema &
  HasForbiddenIdsSchema &
  HasForbiddenNamesSchema

export type CreateSlantedPocketOpeningParamsSchema = ReadonlyCreateSlantedPocketOpeningParamsSchema &
  HasForbiddenIdsSchema &
  HasForbiddenNamesSchema

export type CreateOpticalIllusionPocketOpeningParamsSchema = ReadonlyCreateOpticalIllusionPocketOpeningParamsSchema &
  HasForbiddenIdsSchema &
  HasForbiddenNamesSchema

export type CreateEqualBindingParamsSchema = ReadonlyCreateEqualBindingParamsSchema & HasForbiddenIdsSchema

export type ReadonlyModelObjectFactorySchema = {
  createComponent(params: ReadonlyCreateComponentParamsSchema): ComponentSchema
  createRootPanel(params: ReadonlyCreateRootPanelParamsSchema): RootPanelSchema
  createRootPanelFace(params: ReadonlyCreateRootPanelFaceParamsSchema): RootPanelFaceSchema
  createPanel(params: ReadonlyCreatePanelParamsSchema): PanelSchema
  createPocketCluster(params: ReadonlyCreatePocketClusterParamsSchema): PocketClusterSchema
  createFrontPocket(params: ReadonlyCreateFrontPocketParamsSchema): FrontPocketSchema
  createTPocket(params: ReadonlyCreateTPocketParamsSchema): TPocketSchema
  createStitchLine(params: ReadonlyCreateStitchLineParamsSchema): StitchLineSchema
  createComponentBoundsStitchLine(
    params: ReadonlyCreateComponentBoundsStitchLineParamsSchema,
  ): ComponentBoundsStitchLineSchema
  createTPocketStitchLine(params: ReadonlyCreateTPocketStitchLineParamsSchema): TPocketStitchLineSchema
  createHole(params: ReadonlyCreateHoleParamsSchema): HoleSchema
  createPocketOpening(params: ReadonlyCreatePocketOpeningParamsSchema): PocketOpeningSchema
  createStraightPocketOpening(params: ReadonlyCreateStraightPocketOpeningParamsSchema): StraightPocketOpeningSchema
  createRecessedPocketOpening(params: ReadonlyCreateRecessedPocketOpeningParamsSchema): RecessedPocketOpeningSchema
  createSlantedPocketOpening(params: ReadonlyCreateSlantedPocketOpeningParamsSchema): SlantedPocketOpeningSchema
  createOpticalIllusionPocketOpening(
    params: ReadonlyCreateOpticalIllusionPocketOpeningParamsSchema,
  ): OpticalIllusionPocketOpeningSchema
  createBinding(params: ReadonlyCreateBindingParamsSchema): BindingSchema
  createEqualBinding(params: ReadonlyCreateEqualBindingParamsSchema): EqualBindingSchema
  createBindingField(params: ReadonlyCreateBindingFieldParamsSchema): BindingFieldSchema
  createRootPanelBindingField(params: ReadonlyCreateRootPanelBindingFieldParamsSchema): RootPanelBindingFieldSchema
  createRootPanelFaceBindingField(
    params: ReadonlyCreateRootPanelFaceBindingFieldParamsSchema,
  ): RootPanelFaceBindingFieldSchema
  createPanelBindingField(params: ReadonlyCreatePanelBindingFieldParamsSchema): PanelBindingFieldSchema
  createPocketClusterBindingField(
    params: ReadonlyCreatePocketClusterBindingFieldParamsSchema,
  ): PocketClusterBindingFieldSchema
  createFrontPocketBindingField(
    params: ReadonlyCreateFrontPocketBindingFieldParamsSchema,
  ): FrontPocketBindingFieldSchema
  createTPocketBindingField(params: ReadonlyCreateTPocketBindingFieldParamsSchema): TPocketBindingFieldSchema
  createHoleBindingField(params: ReadonlyCreateHoleBindingFieldParamsSchema): HoleBindingFieldSchema
  createRecessedPocketOpeningBindingField(
    params: ReadonlyCreateRecessedPocketOpeningBindingFieldParamsSchema,
  ): RecessedPocketOpeningBindingFieldSchema
  createSlantedPocketOpeningBindingField(
    params: ReadonlyCreateSlantedPocketOpeningBindingFieldParamsSchema,
  ): SlantedPocketOpeningBindingFieldSchema
  createOpticalIllusionPocketOpeningBindingField(
    params: ReadonlyCreateOpticalIllusionPocketOpeningBindingFieldParamsSchema,
  ): OpticalIllusionPocketOpeningBindingFieldSchema
  createComponentBoundsStitchLineBindingField(
    params: ReadonlyCreateComponentBoundsStitchLineBindingFieldParamsSchema,
  ): ComponentBoundsStitchLineBindingFieldSchema
  createTPocketStitchLineBindingField(
    params: ReadonlyCreateTPocketStitchLineBindingFieldParamsSchema,
  ): TPocketStitchLineBindingFieldSchema
}

export type ModelObjectFactorySchema = {
  createComponent(params: CreateComponentParamsSchema): ComponentSchema
  createRootPanel(params: CreateRootPanelParamsSchema): RootPanelSchema
  createRootPanelFace(params: CreateRootPanelFaceParamsSchema): RootPanelFaceSchema
  createPanel(params: CreatePanelParamsSchema): PanelSchema
  createPocketCluster(params: CreatePocketClusterParamsSchema): PocketClusterSchema
  createFrontPocket(params: CreateFrontPocketParamsSchema): FrontPocketSchema
  createTPocket(params: CreateTPocketParamsSchema): TPocketSchema
  createStitchLine(params: CreateStitchLineParamsSchema): StitchLineSchema
  createComponentBoundsStitchLine(params: CreateComponentBoundsStitchLineParamsSchema): ComponentBoundsStitchLineSchema
  createTPocketStitchLine(params: CreateTPocketStitchLineParamsSchema): TPocketStitchLineSchema
  createHole(params: CreateHoleParamsSchema): HoleSchema
  createPocketOpening(params: CreatePocketOpeningParamsSchema): PocketOpeningSchema
  createStraightPocketOpening(params: CreateStraightPocketOpeningParamsSchema): StraightPocketOpeningSchema
  createRecessedPocketOpening(params: CreateRecessedPocketOpeningParamsSchema): RecessedPocketOpeningSchema
  createSlantedPocketOpening(params: CreateSlantedPocketOpeningParamsSchema): SlantedPocketOpeningSchema
  createOpticalIllusionPocketOpening(
    params: CreateOpticalIllusionPocketOpeningParamsSchema,
  ): OpticalIllusionPocketOpeningSchema
  createBinding(params: CreateBindingParamsSchema): BindingSchema
  createEqualBinding(params: CreateEqualBindingParamsSchema): EqualBindingSchema
  createBindingField(params: CreateBindingFieldParamsSchema): BindingFieldSchema
  createRootPanelBindingField(params: CreateRootPanelBindingFieldParamsSchema): RootPanelBindingFieldSchema
  createRootPanelFaceBindingField(params: CreateRootPanelFaceBindingFieldParamsSchema): RootPanelFaceBindingFieldSchema
  createPanelBindingField(params: CreatePanelBindingFieldParamsSchema): PanelBindingFieldSchema
  createPocketClusterBindingField(params: CreatePocketClusterBindingFieldParamsSchema): PocketClusterBindingFieldSchema
  createFrontPocketBindingField(params: CreateFrontPocketBindingFieldParamsSchema): FrontPocketBindingFieldSchema
  createTPocketBindingField(params: CreateTPocketBindingFieldParamsSchema): TPocketBindingFieldSchema
  createHoleBindingField(params: CreateHoleBindingFieldParamsSchema): HoleBindingFieldSchema
  createRecessedPocketOpeningBindingField(
    params: CreateRecessedPocketOpeningBindingFieldParamsSchema,
  ): RecessedPocketOpeningBindingFieldSchema
  createSlantedPocketOpeningBindingField(
    params: CreateSlantedPocketOpeningBindingFieldParamsSchema,
  ): SlantedPocketOpeningBindingFieldSchema
  createOpticalIllusionPocketOpeningBindingField(
    params: CreateOpticalIllusionPocketOpeningBindingFieldParamsSchema,
  ): OpticalIllusionPocketOpeningBindingFieldSchema
  createComponentBoundsStitchLineBindingField(
    params: CreateComponentBoundsStitchLineBindingFieldParamsSchema,
  ): ComponentBoundsStitchLineBindingFieldSchema
  createTPocketStitchLineBindingField(
    params: CreateTPocketStitchLineBindingFieldParamsSchema,
  ): TPocketStitchLineBindingFieldSchema
}
