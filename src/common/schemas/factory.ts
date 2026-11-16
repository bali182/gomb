import type { HasComponentReferenceSchema, HasComponentTargetSchema, HasTargetSchema } from './common'
import type {
  ComponentSchema,
  FrontPocketSchema,
  HasColorSchema,
  PanelSchema,
  PocketClusterSchema,
  RootPanelSchema,
  TPocketSchema,
} from './components'
import type {
  ComponentBoundsStitchLineBindingFieldSchema,
  BindingFieldSchema,
  BindingSchema,
  EqualBindingSchema,
  FrontPocketBindingFieldSchema,
  HoleBindingFieldSchema,
  OpticalIllusionPocketOpeningBindingFieldSchema,
  PanelBindingFieldSchema,
  PocketClusterBindingFieldSchema,
  RecessedPocketOpeningBindingFieldSchema,
  RootPanelBindingFieldSchema,
  SlantedPocketOpeningBindingFieldSchema,
  TPocketBindingFieldSchema,
  TPocketStitchLineBindingFieldSchema,
} from './constraints'
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

export type ReadonlyCreateComponentParamsSchema = HasReadonlyForbiddenIdsSchema &
  HasReadonlyForbiddenNamesSchema &
  HasColorSchema & {
    type: ComponentSchema['type']
    stitchingSettings: StitchLineCommonConfigSchema
    openingId?: string
  }
export type ReadonlyCreateRootPanelParamsSchema = HasReadonlyForbiddenIdsSchema &
  HasReadonlyForbiddenNamesSchema &
  HasColorSchema & {
    stitchingSettings: StitchLineCommonConfigSchema
  }
export type ReadonlyCreatePanelParamsSchema = HasReadonlyForbiddenIdsSchema &
  HasReadonlyForbiddenNamesSchema &
  HasColorSchema
export type ReadonlyCreatePocketClusterParamsSchema = ReadonlyCreateRootPanelParamsSchema
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
export type ReadonlyCreateConstraintParamsSchema = HasReadonlyForbiddenIdsSchema & {
  type: BindingSchema['type']
}

export type RootPanelConstraintFieldInputSchema = Omit<RootPanelBindingFieldSchema, 'id'>

export type PanelConstraintFieldInputSchema = Omit<PanelBindingFieldSchema, 'id'>

export type PocketClusterConstraintFieldInputSchema = Omit<PocketClusterBindingFieldSchema, 'id'>

export type FrontPocketConstraintFieldInputSchema = Omit<FrontPocketBindingFieldSchema, 'id'>

export type TPocketConstraintFieldInputSchema = Omit<TPocketBindingFieldSchema, 'id'>

export type HoleConstraintFieldInputSchema = Omit<HoleBindingFieldSchema, 'id'>

export type RecessedPocketOpeningConstraintFieldInputSchema = Omit<RecessedPocketOpeningBindingFieldSchema, 'id'>

export type SlantedPocketOpeningConstraintFieldInputSchema = Omit<SlantedPocketOpeningBindingFieldSchema, 'id'>

export type OpticalIllusionPocketOpeningConstraintFieldInputSchema = Omit<
  OpticalIllusionPocketOpeningBindingFieldSchema,
  'id'
>

export type ComponentBoundsStitchLineConstraintFieldInputSchema = Omit<
  ComponentBoundsStitchLineBindingFieldSchema,
  'id'
>

export type TPocketStitchLineConstraintFieldInputSchema = Omit<TPocketStitchLineBindingFieldSchema, 'id'>

export type ConstraintFieldInputSchema =
  | RootPanelConstraintFieldInputSchema
  | PanelConstraintFieldInputSchema
  | PocketClusterConstraintFieldInputSchema
  | FrontPocketConstraintFieldInputSchema
  | TPocketConstraintFieldInputSchema
  | HoleConstraintFieldInputSchema
  | RecessedPocketOpeningConstraintFieldInputSchema
  | SlantedPocketOpeningConstraintFieldInputSchema
  | OpticalIllusionPocketOpeningConstraintFieldInputSchema
  | ComponentBoundsStitchLineConstraintFieldInputSchema
  | TPocketStitchLineConstraintFieldInputSchema

export type ReadonlyCreateConstraintFieldParamsSchema = HasReadonlyForbiddenIdsSchema & ConstraintFieldInputSchema

export type ReadonlyCreateRootPanelConstraintFieldParamsSchema = HasReadonlyForbiddenIdsSchema &
  RootPanelConstraintFieldInputSchema

export type ReadonlyCreatePanelConstraintFieldParamsSchema = HasReadonlyForbiddenIdsSchema &
  PanelConstraintFieldInputSchema

export type ReadonlyCreatePocketClusterConstraintFieldParamsSchema = HasReadonlyForbiddenIdsSchema &
  PocketClusterConstraintFieldInputSchema

export type ReadonlyCreateFrontPocketConstraintFieldParamsSchema = HasReadonlyForbiddenIdsSchema &
  FrontPocketConstraintFieldInputSchema

export type ReadonlyCreateTPocketConstraintFieldParamsSchema = HasReadonlyForbiddenIdsSchema &
  TPocketConstraintFieldInputSchema

export type ReadonlyCreateHoleConstraintFieldParamsSchema = HasReadonlyForbiddenIdsSchema &
  HoleConstraintFieldInputSchema

export type ReadonlyCreateRecessedPocketOpeningConstraintFieldParamsSchema = HasReadonlyForbiddenIdsSchema &
  RecessedPocketOpeningConstraintFieldInputSchema

export type ReadonlyCreateSlantedPocketOpeningConstraintFieldParamsSchema = HasReadonlyForbiddenIdsSchema &
  SlantedPocketOpeningConstraintFieldInputSchema

export type ReadonlyCreateOpticalIllusionPocketOpeningConstraintFieldParamsSchema = HasReadonlyForbiddenIdsSchema &
  OpticalIllusionPocketOpeningConstraintFieldInputSchema

export type ReadonlyCreateComponentBoundsStitchLineConstraintFieldParamsSchema = HasReadonlyForbiddenIdsSchema &
  ComponentBoundsStitchLineConstraintFieldInputSchema

export type ReadonlyCreateTPocketStitchLineConstraintFieldParamsSchema = HasReadonlyForbiddenIdsSchema &
  TPocketStitchLineConstraintFieldInputSchema

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

export type ReadonlyCreateEqualConstraintParamsSchema = HasReadonlyForbiddenIdsSchema

export type CreateComponentParamsSchema = ReadonlyCreateComponentParamsSchema &
  HasForbiddenIdsSchema &
  HasForbiddenNamesSchema

export type CreateRootPanelParamsSchema = ReadonlyCreateRootPanelParamsSchema &
  HasForbiddenIdsSchema &
  HasForbiddenNamesSchema

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

export type CreateConstraintParamsSchema = ReadonlyCreateConstraintParamsSchema & HasForbiddenIdsSchema

export type CreateConstraintFieldParamsSchema = ReadonlyCreateConstraintFieldParamsSchema & HasForbiddenIdsSchema

export type CreateRootPanelConstraintFieldParamsSchema = ReadonlyCreateRootPanelConstraintFieldParamsSchema &
  HasForbiddenIdsSchema

export type CreatePanelConstraintFieldParamsSchema = ReadonlyCreatePanelConstraintFieldParamsSchema &
  HasForbiddenIdsSchema

export type CreatePocketClusterConstraintFieldParamsSchema = ReadonlyCreatePocketClusterConstraintFieldParamsSchema &
  HasForbiddenIdsSchema

export type CreateFrontPocketConstraintFieldParamsSchema = ReadonlyCreateFrontPocketConstraintFieldParamsSchema &
  HasForbiddenIdsSchema

export type CreateTPocketConstraintFieldParamsSchema = ReadonlyCreateTPocketConstraintFieldParamsSchema &
  HasForbiddenIdsSchema

export type CreateHoleConstraintFieldParamsSchema = ReadonlyCreateHoleConstraintFieldParamsSchema &
  HasForbiddenIdsSchema

export type CreateRecessedPocketOpeningConstraintFieldParamsSchema =
  ReadonlyCreateRecessedPocketOpeningConstraintFieldParamsSchema & HasForbiddenIdsSchema

export type CreateSlantedPocketOpeningConstraintFieldParamsSchema =
  ReadonlyCreateSlantedPocketOpeningConstraintFieldParamsSchema & HasForbiddenIdsSchema

export type CreateOpticalIllusionPocketOpeningConstraintFieldParamsSchema =
  ReadonlyCreateOpticalIllusionPocketOpeningConstraintFieldParamsSchema & HasForbiddenIdsSchema

export type CreateComponentBoundsStitchLineConstraintFieldParamsSchema =
  ReadonlyCreateComponentBoundsStitchLineConstraintFieldParamsSchema & HasForbiddenIdsSchema

export type CreateTPocketStitchLineConstraintFieldParamsSchema =
  ReadonlyCreateTPocketStitchLineConstraintFieldParamsSchema & HasForbiddenIdsSchema

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

export type CreateEqualConstraintParamsSchema = ReadonlyCreateEqualConstraintParamsSchema & HasForbiddenIdsSchema

export type ReadonlyModelObjectFactorySchema = {
  createComponent(params: ReadonlyCreateComponentParamsSchema): ComponentSchema
  createRootPanel(params: ReadonlyCreateRootPanelParamsSchema): RootPanelSchema
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
  createConstraint(params: ReadonlyCreateConstraintParamsSchema): BindingSchema
  createEqualConstraint(params: ReadonlyCreateEqualConstraintParamsSchema): EqualBindingSchema
  createConstraintField(params: ReadonlyCreateConstraintFieldParamsSchema): BindingFieldSchema
  createRootPanelConstraintField(
    params: ReadonlyCreateRootPanelConstraintFieldParamsSchema,
  ): RootPanelBindingFieldSchema
  createPanelConstraintField(params: ReadonlyCreatePanelConstraintFieldParamsSchema): PanelBindingFieldSchema
  createPocketClusterConstraintField(
    params: ReadonlyCreatePocketClusterConstraintFieldParamsSchema,
  ): PocketClusterBindingFieldSchema
  createFrontPocketConstraintField(
    params: ReadonlyCreateFrontPocketConstraintFieldParamsSchema,
  ): FrontPocketBindingFieldSchema
  createTPocketConstraintField(params: ReadonlyCreateTPocketConstraintFieldParamsSchema): TPocketBindingFieldSchema
  createHoleConstraintField(params: ReadonlyCreateHoleConstraintFieldParamsSchema): HoleBindingFieldSchema
  createRecessedPocketOpeningConstraintField(
    params: ReadonlyCreateRecessedPocketOpeningConstraintFieldParamsSchema,
  ): RecessedPocketOpeningBindingFieldSchema
  createSlantedPocketOpeningConstraintField(
    params: ReadonlyCreateSlantedPocketOpeningConstraintFieldParamsSchema,
  ): SlantedPocketOpeningBindingFieldSchema
  createOpticalIllusionPocketOpeningConstraintField(
    params: ReadonlyCreateOpticalIllusionPocketOpeningConstraintFieldParamsSchema,
  ): OpticalIllusionPocketOpeningBindingFieldSchema
  createComponentBoundsStitchLineConstraintField(
    params: ReadonlyCreateComponentBoundsStitchLineConstraintFieldParamsSchema,
  ): ComponentBoundsStitchLineBindingFieldSchema
  createTPocketStitchLineConstraintField(
    params: ReadonlyCreateTPocketStitchLineConstraintFieldParamsSchema,
  ): TPocketStitchLineBindingFieldSchema
}

export type ModelObjectFactorySchema = {
  createComponent(params: CreateComponentParamsSchema): ComponentSchema
  createRootPanel(params: CreateRootPanelParamsSchema): RootPanelSchema
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
  createConstraint(params: CreateConstraintParamsSchema): BindingSchema
  createEqualConstraint(params: CreateEqualConstraintParamsSchema): EqualBindingSchema
  createConstraintField(params: CreateConstraintFieldParamsSchema): BindingFieldSchema
  createRootPanelConstraintField(params: CreateRootPanelConstraintFieldParamsSchema): RootPanelBindingFieldSchema
  createPanelConstraintField(params: CreatePanelConstraintFieldParamsSchema): PanelBindingFieldSchema
  createPocketClusterConstraintField(
    params: CreatePocketClusterConstraintFieldParamsSchema,
  ): PocketClusterBindingFieldSchema
  createFrontPocketConstraintField(
    params: CreateFrontPocketConstraintFieldParamsSchema,
  ): FrontPocketBindingFieldSchema
  createTPocketConstraintField(params: CreateTPocketConstraintFieldParamsSchema): TPocketBindingFieldSchema
  createHoleConstraintField(params: CreateHoleConstraintFieldParamsSchema): HoleBindingFieldSchema
  createRecessedPocketOpeningConstraintField(
    params: CreateRecessedPocketOpeningConstraintFieldParamsSchema,
  ): RecessedPocketOpeningBindingFieldSchema
  createSlantedPocketOpeningConstraintField(
    params: CreateSlantedPocketOpeningConstraintFieldParamsSchema,
  ): SlantedPocketOpeningBindingFieldSchema
  createOpticalIllusionPocketOpeningConstraintField(
    params: CreateOpticalIllusionPocketOpeningConstraintFieldParamsSchema,
  ): OpticalIllusionPocketOpeningBindingFieldSchema
  createComponentBoundsStitchLineConstraintField(
    params: CreateComponentBoundsStitchLineConstraintFieldParamsSchema,
  ): ComponentBoundsStitchLineBindingFieldSchema
  createTPocketStitchLineConstraintField(
    params: CreateTPocketStitchLineConstraintFieldParamsSchema,
  ): TPocketStitchLineBindingFieldSchema
}
