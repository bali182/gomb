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
  SlantedPocketOpeningBindingFieldSchema,
  TPocketBindingFieldSchema,
  TPocketStitchLineBindingFieldSchema,
} from '../../schemas/bindings'
import type {
  ComponentSchema,
  FrontPocketSchema,
  PanelSchema,
  PocketClusterSchema,
  RootPanelSchema,
  TPocketSchema,
} from '../../schemas/components'
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

  public createBinding(params: Factory.CreateBindingParamsSchema): BindingSchema {
    const model = this.readonlyFactory.createBinding(params)
    params.forbiddenIds.add(model.id)
    return model
  }

  public createEqualBinding(params: Factory.CreateEqualBindingParamsSchema): EqualBindingSchema {
    const model = this.readonlyFactory.createEqualBinding(params)
    params.forbiddenIds.add(model.id)
    return model
  }

  public createBindingField(params: Factory.CreateBindingFieldParamsSchema): BindingFieldSchema {
    const model = this.readonlyFactory.createBindingField(params)
    params.forbiddenIds.add(model.id)
    return model
  }

  public createRootPanelBindingField(
    params: Factory.CreateRootPanelBindingFieldParamsSchema,
  ): RootPanelBindingFieldSchema {
    const model = this.readonlyFactory.createRootPanelBindingField(params)
    params.forbiddenIds.add(model.id)
    return model
  }

  public createPanelBindingField(params: Factory.CreatePanelBindingFieldParamsSchema): PanelBindingFieldSchema {
    const model = this.readonlyFactory.createPanelBindingField(params)
    params.forbiddenIds.add(model.id)
    return model
  }

  public createPocketClusterBindingField(
    params: Factory.CreatePocketClusterBindingFieldParamsSchema,
  ): PocketClusterBindingFieldSchema {
    const model = this.readonlyFactory.createPocketClusterBindingField(params)
    params.forbiddenIds.add(model.id)
    return model
  }

  public createFrontPocketBindingField(
    params: Factory.CreateFrontPocketBindingFieldParamsSchema,
  ): FrontPocketBindingFieldSchema {
    const model = this.readonlyFactory.createFrontPocketBindingField(params)
    params.forbiddenIds.add(model.id)
    return model
  }

  public createTPocketBindingField(params: Factory.CreateTPocketBindingFieldParamsSchema): TPocketBindingFieldSchema {
    const model = this.readonlyFactory.createTPocketBindingField(params)
    params.forbiddenIds.add(model.id)
    return model
  }

  public createHoleBindingField(params: Factory.CreateHoleBindingFieldParamsSchema): HoleBindingFieldSchema {
    const model = this.readonlyFactory.createHoleBindingField(params)
    params.forbiddenIds.add(model.id)
    return model
  }

  public createRecessedPocketOpeningBindingField(
    params: Factory.CreateRecessedPocketOpeningBindingFieldParamsSchema,
  ): RecessedPocketOpeningBindingFieldSchema {
    const model = this.readonlyFactory.createRecessedPocketOpeningBindingField(params)
    params.forbiddenIds.add(model.id)
    return model
  }

  public createSlantedPocketOpeningBindingField(
    params: Factory.CreateSlantedPocketOpeningBindingFieldParamsSchema,
  ): SlantedPocketOpeningBindingFieldSchema {
    const model = this.readonlyFactory.createSlantedPocketOpeningBindingField(params)
    params.forbiddenIds.add(model.id)
    return model
  }

  public createOpticalIllusionPocketOpeningBindingField(
    params: Factory.CreateOpticalIllusionPocketOpeningBindingFieldParamsSchema,
  ): OpticalIllusionPocketOpeningBindingFieldSchema {
    const model = this.readonlyFactory.createOpticalIllusionPocketOpeningBindingField(params)
    params.forbiddenIds.add(model.id)
    return model
  }

  public createComponentBoundsStitchLineBindingField(
    params: Factory.CreateComponentBoundsStitchLineBindingFieldParamsSchema,
  ): ComponentBoundsStitchLineBindingFieldSchema {
    const model = this.readonlyFactory.createComponentBoundsStitchLineBindingField(params)
    params.forbiddenIds.add(model.id)
    return model
  }

  public createTPocketStitchLineBindingField(
    params: Factory.CreateTPocketStitchLineBindingFieldParamsSchema,
  ): TPocketStitchLineBindingFieldSchema {
    const model = this.readonlyFactory.createTPocketStitchLineBindingField(params)
    params.forbiddenIds.add(model.id)
    return model
  }
}
