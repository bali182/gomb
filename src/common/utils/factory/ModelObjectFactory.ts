import type {
  ComponentSchema,
  FrontPocketSchema,
  PanelSchema,
  PocketClusterSchema,
  RootPanelSchema,
  TPocketSchema,
} from '../../schemas/components'
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
} from '../../schemas/constraints'
import type * as Factory from '../../schemas/factory'
import type { HoleSchema } from '../../schemas/hole'
import type { IdGeneratorSchema, NameGeneratorSchema } from '../../schemas/idGenerator'
import type {
  OpticalIllusionPocketOpeningSchema,
  PocketOpeningSchema,
  RecessedPocketOpeningSchema,
  SlantedPocketOpeningSchema,
  StraightPocketOpeningSchema,
} from '../../schemas/pocketOpening'
import type {
  ComponentBoundsStitchLineSchema,
  StitchLineSchema,
  TPocketStitchLineSchema,
} from '../../schemas/stitching'
import { ReadonlyModelObjectFactory } from './ReadonlyModelObjectFactory'

export class ModelObjectFactory implements Factory.ModelObjectFactorySchema {
  private readonly readonlyFactory: Factory.ReadonlyModelObjectFactorySchema

  constructor(id: IdGeneratorSchema, name: NameGeneratorSchema) {
    this.readonlyFactory = new ReadonlyModelObjectFactory(id, name)
  }

  public createComponent(params: Factory.CreateComponentParamsSchema): ComponentSchema {
    const model = this.readonlyFactory.createComponent(params)
    params.forbiddenIds.add(model.id)
    params.forbiddenNames.add(model.name)
    return model
  }

  public createRootPanel(params: Factory.CreateRootPanelParamsSchema): RootPanelSchema {
    const model = this.readonlyFactory.createRootPanel(params)
    params.forbiddenIds.add(model.id)
    params.forbiddenNames.add(model.name)
    return model
  }

  public createPanel(params: Factory.CreatePanelParamsSchema): PanelSchema {
    const model = this.readonlyFactory.createPanel(params)
    params.forbiddenIds.add(model.id)
    params.forbiddenNames.add(model.name)
    return model
  }

  public createPocketCluster(params: Factory.CreatePocketClusterParamsSchema): PocketClusterSchema {
    const model = this.readonlyFactory.createPocketCluster(params)
    params.forbiddenIds.add(model.id)
    params.forbiddenNames.add(model.name)
    return model
  }

  public createFrontPocket(params: Factory.CreateFrontPocketParamsSchema): FrontPocketSchema {
    const model = this.readonlyFactory.createFrontPocket(params)
    params.forbiddenIds.add(model.id)
    params.forbiddenNames.add(model.name)
    return model
  }

  public createTPocket(params: Factory.CreateTPocketParamsSchema): TPocketSchema {
    const model = this.readonlyFactory.createTPocket(params)
    params.forbiddenIds.add(model.id)
    params.forbiddenNames.add(model.name)
    return model
  }

  public createStitchLine(params: Factory.CreateStitchLineParamsSchema): StitchLineSchema {
    const model = this.readonlyFactory.createStitchLine(params)
    params.forbiddenIds.add(model.id)
    params.forbiddenNames.add(model.name)
    return model
  }

  public createComponentBoundsStitchLine(
    params: Factory.CreateComponentBoundsStitchLineParamsSchema,
  ): ComponentBoundsStitchLineSchema {
    const model = this.readonlyFactory.createComponentBoundsStitchLine(params)
    params.forbiddenIds.add(model.id)
    params.forbiddenNames.add(model.name)
    return model
  }

  public createTPocketStitchLine(params: Factory.CreateTPocketStitchLineParamsSchema): TPocketStitchLineSchema {
    const model = this.readonlyFactory.createTPocketStitchLine(params)
    params.forbiddenIds.add(model.id)
    params.forbiddenNames.add(model.name)
    return model
  }

  public createHole(params: Factory.CreateHoleParamsSchema): HoleSchema {
    const model = this.readonlyFactory.createHole(params)
    params.forbiddenIds.add(model.id)
    params.forbiddenNames.add(model.name)
    return model
  }

  public createPocketOpening(params: Factory.CreatePocketOpeningParamsSchema): PocketOpeningSchema {
    const model = this.readonlyFactory.createPocketOpening(params)
    params.forbiddenIds.add(model.id)
    params.forbiddenNames.add(model.name)
    return model
  }

  public createStraightPocketOpening(
    params: Factory.CreateStraightPocketOpeningParamsSchema,
  ): StraightPocketOpeningSchema {
    const model = this.readonlyFactory.createStraightPocketOpening(params)
    params.forbiddenIds.add(model.id)
    params.forbiddenNames.add(model.name)
    return model
  }

  public createRecessedPocketOpening(
    params: Factory.CreateRecessedPocketOpeningParamsSchema,
  ): RecessedPocketOpeningSchema {
    const model = this.readonlyFactory.createRecessedPocketOpening(params)
    params.forbiddenIds.add(model.id)
    params.forbiddenNames.add(model.name)
    return model
  }

  public createSlantedPocketOpening(
    params: Factory.CreateSlantedPocketOpeningParamsSchema,
  ): SlantedPocketOpeningSchema {
    const model = this.readonlyFactory.createSlantedPocketOpening(params)
    params.forbiddenIds.add(model.id)
    params.forbiddenNames.add(model.name)
    return model
  }

  public createOpticalIllusionPocketOpening(
    params: Factory.CreateOpticalIllusionPocketOpeningParamsSchema,
  ): OpticalIllusionPocketOpeningSchema {
    const model = this.readonlyFactory.createOpticalIllusionPocketOpening(params)
    params.forbiddenIds.add(model.id)
    params.forbiddenNames.add(model.name)
    return model
  }

  public createConstraint(params: Factory.CreateConstraintParamsSchema): ConstraintSchema {
    const model = this.readonlyFactory.createConstraint(params)
    params.forbiddenIds.add(model.id)
    return model
  }

  public createEqualConstraint(params: Factory.CreateEqualConstraintParamsSchema): EqualConstraintSchema {
    const model = this.readonlyFactory.createEqualConstraint(params)
    params.forbiddenIds.add(model.id)
    return model
  }

  public createConstraintField(params: Factory.CreateConstraintFieldParamsSchema): ConstraintFieldSchema {
    const model = this.readonlyFactory.createConstraintField(params)
    params.forbiddenIds.add(model.id)
    return model
  }

  public createRootPanelConstraintField(
    params: Factory.CreateRootPanelConstraintFieldParamsSchema,
  ): RootPanelConstraintFieldSchema {
    const model = this.readonlyFactory.createRootPanelConstraintField(params)
    params.forbiddenIds.add(model.id)
    return model
  }

  public createPanelConstraintField(
    params: Factory.CreatePanelConstraintFieldParamsSchema,
  ): PanelConstraintFieldSchema {
    const model = this.readonlyFactory.createPanelConstraintField(params)
    params.forbiddenIds.add(model.id)
    return model
  }

  public createPocketClusterConstraintField(
    params: Factory.CreatePocketClusterConstraintFieldParamsSchema,
  ): PocketClusterConstraintFieldSchema {
    const model = this.readonlyFactory.createPocketClusterConstraintField(params)
    params.forbiddenIds.add(model.id)
    return model
  }

  public createFrontPocketConstraintField(
    params: Factory.CreateFrontPocketConstraintFieldParamsSchema,
  ): FrontPocketConstraintFieldSchema {
    const model = this.readonlyFactory.createFrontPocketConstraintField(params)
    params.forbiddenIds.add(model.id)
    return model
  }

  public createTPocketConstraintField(
    params: Factory.CreateTPocketConstraintFieldParamsSchema,
  ): TPocketConstraintFieldSchema {
    const model = this.readonlyFactory.createTPocketConstraintField(params)
    params.forbiddenIds.add(model.id)
    return model
  }

  public createHoleConstraintField(params: Factory.CreateHoleConstraintFieldParamsSchema): HoleConstraintFieldSchema {
    const model = this.readonlyFactory.createHoleConstraintField(params)
    params.forbiddenIds.add(model.id)
    return model
  }

  public createRecessedPocketOpeningConstraintField(
    params: Factory.CreateRecessedPocketOpeningConstraintFieldParamsSchema,
  ): RecessedPocketOpeningConstraintFieldSchema {
    const model = this.readonlyFactory.createRecessedPocketOpeningConstraintField(params)
    params.forbiddenIds.add(model.id)
    return model
  }

  public createSlantedPocketOpeningConstraintField(
    params: Factory.CreateSlantedPocketOpeningConstraintFieldParamsSchema,
  ): SlantedPocketOpeningConstraintFieldSchema {
    const model = this.readonlyFactory.createSlantedPocketOpeningConstraintField(params)
    params.forbiddenIds.add(model.id)
    return model
  }

  public createOpticalIllusionPocketOpeningConstraintField(
    params: Factory.CreateOpticalIllusionPocketOpeningConstraintFieldParamsSchema,
  ): OpticalIllusionPocketOpeningConstraintFieldSchema {
    const model = this.readonlyFactory.createOpticalIllusionPocketOpeningConstraintField(params)
    params.forbiddenIds.add(model.id)
    return model
  }

  public createComponentBoundsStitchLineConstraintField(
    params: Factory.CreateComponentBoundsStitchLineConstraintFieldParamsSchema,
  ): ComponentBoundsStitchLineConstraintFieldSchema {
    const model = this.readonlyFactory.createComponentBoundsStitchLineConstraintField(params)
    params.forbiddenIds.add(model.id)
    return model
  }

  public createTPocketStitchLineConstraintField(
    params: Factory.CreateTPocketStitchLineConstraintFieldParamsSchema,
  ): TPocketStitchLineConstraintFieldSchema {
    const model = this.readonlyFactory.createTPocketStitchLineConstraintField(params)
    params.forbiddenIds.add(model.id)
    return model
  }
}
