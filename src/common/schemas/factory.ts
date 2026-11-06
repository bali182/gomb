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
  ComponentBoundsStitchLineConstraintFieldSchema,
  ConstraintFieldSchema,
  ConstraintSchema,
  EqualConstraintSchema,
  FrontPocketConstraintFieldSchema,
  HoleConstraintFieldSchema,
  OpticalIllusionPocketOpeningConstraintFieldSchema,
  PanelConstraintFieldSchema,
  PocketClusterConstraintFieldSchema,
  RecessedPocketOpeningConstraintFieldSchema,
  RootPanelConstraintFieldSchema,
  SlantedPocketOpeningConstraintFieldSchema,
  TPocketConstraintFieldSchema,
  TPocketStitchLineConstraintFieldSchema,
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
  type: ConstraintSchema['type']
}

export type RootPanelConstraintFieldInputSchema = Omit<RootPanelConstraintFieldSchema, 'id'>

export type PanelConstraintFieldInputSchema = Omit<PanelConstraintFieldSchema, 'id'>

export type PocketClusterConstraintFieldInputSchema = Omit<PocketClusterConstraintFieldSchema, 'id'>

export type FrontPocketConstraintFieldInputSchema = Omit<FrontPocketConstraintFieldSchema, 'id'>

export type TPocketConstraintFieldInputSchema = Omit<TPocketConstraintFieldSchema, 'id'>

export type HoleConstraintFieldInputSchema = Omit<HoleConstraintFieldSchema, 'id'>

export type RecessedPocketOpeningConstraintFieldInputSchema = Omit<RecessedPocketOpeningConstraintFieldSchema, 'id'>

export type SlantedPocketOpeningConstraintFieldInputSchema = Omit<SlantedPocketOpeningConstraintFieldSchema, 'id'>

export type OpticalIllusionPocketOpeningConstraintFieldInputSchema = Omit<
  OpticalIllusionPocketOpeningConstraintFieldSchema,
  'id'
>

export type ComponentBoundsStitchLineConstraintFieldInputSchema = Omit<
  ComponentBoundsStitchLineConstraintFieldSchema,
  'id'
>

export type TPocketStitchLineConstraintFieldInputSchema = Omit<TPocketStitchLineConstraintFieldSchema, 'id'>

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
  createConstraint(params: ReadonlyCreateConstraintParamsSchema): ConstraintSchema
  createEqualConstraint(params: ReadonlyCreateEqualConstraintParamsSchema): EqualConstraintSchema
  createConstraintField(params: ReadonlyCreateConstraintFieldParamsSchema): ConstraintFieldSchema
  createRootPanelConstraintField(
    params: ReadonlyCreateRootPanelConstraintFieldParamsSchema,
  ): RootPanelConstraintFieldSchema
  createPanelConstraintField(params: ReadonlyCreatePanelConstraintFieldParamsSchema): PanelConstraintFieldSchema
  createPocketClusterConstraintField(
    params: ReadonlyCreatePocketClusterConstraintFieldParamsSchema,
  ): PocketClusterConstraintFieldSchema
  createFrontPocketConstraintField(
    params: ReadonlyCreateFrontPocketConstraintFieldParamsSchema,
  ): FrontPocketConstraintFieldSchema
  createTPocketConstraintField(params: ReadonlyCreateTPocketConstraintFieldParamsSchema): TPocketConstraintFieldSchema
  createHoleConstraintField(params: ReadonlyCreateHoleConstraintFieldParamsSchema): HoleConstraintFieldSchema
  createRecessedPocketOpeningConstraintField(
    params: ReadonlyCreateRecessedPocketOpeningConstraintFieldParamsSchema,
  ): RecessedPocketOpeningConstraintFieldSchema
  createSlantedPocketOpeningConstraintField(
    params: ReadonlyCreateSlantedPocketOpeningConstraintFieldParamsSchema,
  ): SlantedPocketOpeningConstraintFieldSchema
  createOpticalIllusionPocketOpeningConstraintField(
    params: ReadonlyCreateOpticalIllusionPocketOpeningConstraintFieldParamsSchema,
  ): OpticalIllusionPocketOpeningConstraintFieldSchema
  createComponentBoundsStitchLineConstraintField(
    params: ReadonlyCreateComponentBoundsStitchLineConstraintFieldParamsSchema,
  ): ComponentBoundsStitchLineConstraintFieldSchema
  createTPocketStitchLineConstraintField(
    params: ReadonlyCreateTPocketStitchLineConstraintFieldParamsSchema,
  ): TPocketStitchLineConstraintFieldSchema
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
  createConstraint(params: CreateConstraintParamsSchema): ConstraintSchema
  createEqualConstraint(params: CreateEqualConstraintParamsSchema): EqualConstraintSchema
  createConstraintField(params: CreateConstraintFieldParamsSchema): ConstraintFieldSchema
  createRootPanelConstraintField(params: CreateRootPanelConstraintFieldParamsSchema): RootPanelConstraintFieldSchema
  createPanelConstraintField(params: CreatePanelConstraintFieldParamsSchema): PanelConstraintFieldSchema
  createPocketClusterConstraintField(
    params: CreatePocketClusterConstraintFieldParamsSchema,
  ): PocketClusterConstraintFieldSchema
  createFrontPocketConstraintField(
    params: CreateFrontPocketConstraintFieldParamsSchema,
  ): FrontPocketConstraintFieldSchema
  createTPocketConstraintField(params: CreateTPocketConstraintFieldParamsSchema): TPocketConstraintFieldSchema
  createHoleConstraintField(params: CreateHoleConstraintFieldParamsSchema): HoleConstraintFieldSchema
  createRecessedPocketOpeningConstraintField(
    params: CreateRecessedPocketOpeningConstraintFieldParamsSchema,
  ): RecessedPocketOpeningConstraintFieldSchema
  createSlantedPocketOpeningConstraintField(
    params: CreateSlantedPocketOpeningConstraintFieldParamsSchema,
  ): SlantedPocketOpeningConstraintFieldSchema
  createOpticalIllusionPocketOpeningConstraintField(
    params: CreateOpticalIllusionPocketOpeningConstraintFieldParamsSchema,
  ): OpticalIllusionPocketOpeningConstraintFieldSchema
  createComponentBoundsStitchLineConstraintField(
    params: CreateComponentBoundsStitchLineConstraintFieldParamsSchema,
  ): ComponentBoundsStitchLineConstraintFieldSchema
  createTPocketStitchLineConstraintField(
    params: CreateTPocketStitchLineConstraintFieldParamsSchema,
  ): TPocketStitchLineConstraintFieldSchema
}
