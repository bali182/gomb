import {
  defaultComponentBoundsStitchLine,
  defaultFrontPocket,
  defaultHole,
  defaultOpticalIllusionPocketOpening,
  defaultPanel,
  defaultPocketCluster,
  defaultRecessedPocketOpening,
  defaultRootPanel,
  defaultSlantedPocketOpening,
  defaultTPocket,
  defaultTPocketStitchLine,
} from '../../defaultStates'
import { getClosestPocketStepSize, getClosestRootDimensions } from '../../operations/subProject/utils/dimensionUtils'
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
import { isDefined } from '../isDefined'

export class ReadonlyModelObjectFactory implements Factory.ReadonlyModelObjectFactorySchema {
  constructor(
    private readonly id: IdGeneratorSchema,
    private readonly name: NameGeneratorSchema,
  ) {}

  public createComponent(params: Factory.ReadonlyCreateComponentParamsSchema): ComponentSchema {
    switch (params.type) {
      case 'root-panel':
        return this.createRootPanel(params)
      case 'panel':
        return this.createPanel(params)
      case 'pocket-cluster':
        return this.createPocketCluster(params)
      case 'front-pocket':
      case 't-pocket': {
        if (!isDefined(params.openingId)) {
          throw new Error('An opening ID is required to create a pocket')
        }
        const pocketParams: Factory.ReadonlyCreatePocketParamsSchema = { ...params, openingId: params.openingId }
        return params.type === 'front-pocket' ? this.createFrontPocket(pocketParams) : this.createTPocket(pocketParams)
      }
    }
  }

  public createRootPanel(params: Factory.ReadonlyCreateRootPanelParamsSchema): RootPanelSchema {
    return {
      ...defaultRootPanel,
      children: [],
      id: this.id.get('root-panel', params.forbiddenIds),
      name: this.name.get('root-panel', params.forbiddenNames),
      ...getClosestRootDimensions(defaultRootPanel, params.stitchingSettings),
      ...(isDefined(params.color) ? { color: params.color } : {}),
    }
  }

  public createPanel(params: Factory.ReadonlyCreatePanelParamsSchema): PanelSchema {
    return {
      ...defaultPanel,
      children: [],
      id: this.id.get('panel', params.forbiddenIds),
      name: this.name.get('panel', params.forbiddenNames),
      ...(isDefined(params.color) ? { color: params.color } : {}),
    }
  }

  public createPocketCluster(params: Factory.ReadonlyCreatePocketClusterParamsSchema): PocketClusterSchema {
    return {
      ...defaultPocketCluster,
      children: [],
      id: this.id.get('pocket-cluster', params.forbiddenIds),
      name: this.name.get('pocket-cluster', params.forbiddenNames),
      pocketStep: getClosestPocketStepSize(defaultPocketCluster.pocketStep, params.stitchingSettings),
      ...(isDefined(params.color) ? { color: params.color } : {}),
    }
  }

  public createFrontPocket(params: Factory.ReadonlyCreateFrontPocketParamsSchema): FrontPocketSchema {
    return {
      ...defaultFrontPocket,
      children: [],
      id: this.id.get('front-pocket', params.forbiddenIds),
      name: this.name.get('front-pocket', params.forbiddenNames),
      openingId: params.openingId,
      ...(isDefined(params.color) ? { color: params.color } : {}),
    }
  }

  public createTPocket(params: Factory.ReadonlyCreateTPocketParamsSchema): TPocketSchema {
    return {
      ...defaultTPocket,
      children: [],
      id: this.id.get('t-pocket', params.forbiddenIds),
      name: this.name.get('t-pocket', params.forbiddenNames),
      openingId: params.openingId,
      ...(isDefined(params.color) ? { color: params.color } : {}),
    }
  }

  public createStitchLine(params: Factory.ReadonlyCreateStitchLineParamsSchema): StitchLineSchema {
    switch (params.type) {
      case 'component-bounds-stitch-line':
        return this.createComponentBoundsStitchLine(params)
      case 't-pocket-stitch-line':
        if (params.targetType === 'hole') {
          throw new Error('T-pocket stitch lines cannot target holes')
        }
        return this.createTPocketStitchLine({ ...params, targetType: 'component' })
    }
  }

  public createComponentBoundsStitchLine(
    params: Factory.ReadonlyCreateComponentBoundsStitchLineParamsSchema,
  ): ComponentBoundsStitchLineSchema {
    return {
      ...defaultComponentBoundsStitchLine,
      type: 'component-bounds-stitch-line',
      targetId: params.targetId,
      targetType: params.targetType,
      id: this.id.get('component-bounds-stitch-line', params.forbiddenIds),
      name: this.name.get('component-bounds-stitch-line', params.forbiddenNames),
    }
  }

  public createTPocketStitchLine(params: Factory.ReadonlyCreateTPocketStitchLineParamsSchema): TPocketStitchLineSchema {
    return {
      ...defaultTPocketStitchLine,
      type: 't-pocket-stitch-line',
      targetId: params.targetId,
      targetType: 'component',
      id: this.id.get('t-pocket-stitch-line', params.forbiddenIds),
      name: this.name.get('t-pocket-stitch-line', params.forbiddenNames),
    }
  }

  public createHole(params: Factory.ReadonlyCreateHoleParamsSchema): HoleSchema {
    return {
      ...defaultHole,
      componentId: params.componentId,
      id: this.id.get('hole', params.forbiddenIds),
      name: this.name.get('hole', params.forbiddenNames),
    }
  }

  public createPocketOpening(params: Factory.ReadonlyCreatePocketOpeningParamsSchema): PocketOpeningSchema {
    switch (params.type) {
      case 'straight':
        return this.createStraightPocketOpening(params)
      case 'recessed':
        return this.createRecessedPocketOpening(params)
      case 'slanted':
        return this.createSlantedPocketOpening(params)
      case 'optical-illusion':
        return this.createOpticalIllusionPocketOpening(params)
    }
  }

  public createStraightPocketOpening(
    params: Factory.ReadonlyCreateStraightPocketOpeningParamsSchema,
  ): StraightPocketOpeningSchema {
    return {
      type: 'straight',
      id: this.id.get('straight-pocket-opening', params.forbiddenIds),
      name: this.name.get('straight-pocket-opening', params.forbiddenNames),
    }
  }

  public createRecessedPocketOpening(
    params: Factory.ReadonlyCreateRecessedPocketOpeningParamsSchema,
  ): RecessedPocketOpeningSchema {
    return {
      ...defaultRecessedPocketOpening,
      type: 'recessed',
      id: this.id.get('recessed-pocket-opening', params.forbiddenIds),
      name: this.name.get('recessed-pocket-opening', params.forbiddenNames),
    }
  }

  public createSlantedPocketOpening(
    params: Factory.ReadonlyCreateSlantedPocketOpeningParamsSchema,
  ): SlantedPocketOpeningSchema {
    return {
      ...defaultSlantedPocketOpening,
      type: 'slanted',
      id: this.id.get('slanted-pocket-opening', params.forbiddenIds),
      name: this.name.get('slanted-pocket-opening', params.forbiddenNames),
    }
  }

  public createOpticalIllusionPocketOpening(
    params: Factory.ReadonlyCreateOpticalIllusionPocketOpeningParamsSchema,
  ): OpticalIllusionPocketOpeningSchema {
    return {
      ...defaultOpticalIllusionPocketOpening,
      type: 'optical-illusion',
      id: this.id.get('optical-illusion-pocket-opening', params.forbiddenIds),
      name: this.name.get('optical-illusion-pocket-opening', params.forbiddenNames),
    }
  }

  public createConstraint(params: Factory.ReadonlyCreateConstraintParamsSchema): ConstraintSchema {
    switch (params.type) {
      case 'equal-constraint':
        return this.createEqualConstraint(params)
    }
  }

  public createEqualConstraint(params: Factory.ReadonlyCreateEqualConstraintParamsSchema): EqualConstraintSchema {
    return { id: this.id.get('equal-constraint', params.forbiddenIds), type: 'equal-constraint', fields: [] }
  }

  public createConstraintField(params: Factory.ReadonlyCreateConstraintFieldParamsSchema): ConstraintFieldSchema {
    switch (params.type) {
      case 'root-panel-constraint-field':
        return this.createRootPanelConstraintField(params)
      case 'panel-constraint-field':
        return this.createPanelConstraintField(params)
      case 'pocket-cluster-constraint-field':
        return this.createPocketClusterConstraintField(params)
      case 'front-pocket-constraint-field':
        return this.createFrontPocketConstraintField(params)
      case 't-pocket-constraint-field':
        return this.createTPocketConstraintField(params)
      case 'hole-constraint-field':
        return this.createHoleConstraintField(params)
      case 'recessed-constraint-field':
        return this.createRecessedPocketOpeningConstraintField(params)
      case 'slanted-constraint-field':
        return this.createSlantedPocketOpeningConstraintField(params)
      case 'optical-illusion-constraint-field':
        return this.createOpticalIllusionPocketOpeningConstraintField(params)
      case 'component-bounds-stitch-line-constraint-field':
        return this.createComponentBoundsStitchLineConstraintField(params)
      case 't-pocket-stitch-line-constraint-field':
        return this.createTPocketStitchLineConstraintField(params)
    }
  }

  public createRootPanelConstraintField(
    params: Factory.ReadonlyCreateRootPanelConstraintFieldParamsSchema,
  ): RootPanelConstraintFieldSchema {
    return {
      id: this.id.get('root-panel-constraint-field', params.forbiddenIds),
      type: 'root-panel-constraint-field',
      modelId: params.modelId,
      field: params.field,
    }
  }

  public createPanelConstraintField(
    params: Factory.ReadonlyCreatePanelConstraintFieldParamsSchema,
  ): PanelConstraintFieldSchema {
    return {
      id: this.id.get('panel-constraint-field', params.forbiddenIds),
      type: 'panel-constraint-field',
      modelId: params.modelId,
      field: params.field,
    }
  }

  public createPocketClusterConstraintField(
    params: Factory.ReadonlyCreatePocketClusterConstraintFieldParamsSchema,
  ): PocketClusterConstraintFieldSchema {
    return {
      id: this.id.get('pocket-cluster-constraint-field', params.forbiddenIds),
      type: 'pocket-cluster-constraint-field',
      modelId: params.modelId,
      field: params.field,
    }
  }

  public createFrontPocketConstraintField(
    params: Factory.ReadonlyCreateFrontPocketConstraintFieldParamsSchema,
  ): FrontPocketConstraintFieldSchema {
    return {
      id: this.id.get('front-pocket-constraint-field', params.forbiddenIds),
      type: 'front-pocket-constraint-field',
      modelId: params.modelId,
      field: params.field,
    }
  }

  public createTPocketConstraintField(
    params: Factory.ReadonlyCreateTPocketConstraintFieldParamsSchema,
  ): TPocketConstraintFieldSchema {
    return {
      id: this.id.get('t-pocket-constraint-field', params.forbiddenIds),
      type: 't-pocket-constraint-field',
      modelId: params.modelId,
      field: params.field,
    }
  }

  public createHoleConstraintField(
    params: Factory.ReadonlyCreateHoleConstraintFieldParamsSchema,
  ): HoleConstraintFieldSchema {
    return {
      id: this.id.get('hole-constraint-field', params.forbiddenIds),
      type: 'hole-constraint-field',
      modelId: params.modelId,
      field: params.field,
    }
  }

  public createRecessedPocketOpeningConstraintField(
    params: Factory.ReadonlyCreateRecessedPocketOpeningConstraintFieldParamsSchema,
  ): RecessedPocketOpeningConstraintFieldSchema {
    return {
      id: this.id.get('recessed-constraint-field', params.forbiddenIds),
      type: 'recessed-constraint-field',
      modelId: params.modelId,
      field: params.field,
    }
  }

  public createSlantedPocketOpeningConstraintField(
    params: Factory.ReadonlyCreateSlantedPocketOpeningConstraintFieldParamsSchema,
  ): SlantedPocketOpeningConstraintFieldSchema {
    return {
      id: this.id.get('slanted-constraint-field', params.forbiddenIds),
      type: 'slanted-constraint-field',
      modelId: params.modelId,
      field: params.field,
    }
  }

  public createOpticalIllusionPocketOpeningConstraintField(
    params: Factory.ReadonlyCreateOpticalIllusionPocketOpeningConstraintFieldParamsSchema,
  ): OpticalIllusionPocketOpeningConstraintFieldSchema {
    return {
      id: this.id.get('optical-illusion-constraint-field', params.forbiddenIds),
      type: 'optical-illusion-constraint-field',
      modelId: params.modelId,
      field: params.field,
    }
  }

  public createComponentBoundsStitchLineConstraintField(
    params: Factory.ReadonlyCreateComponentBoundsStitchLineConstraintFieldParamsSchema,
  ): ComponentBoundsStitchLineConstraintFieldSchema {
    return {
      id: this.id.get('component-bounds-stitch-line-constraint-field', params.forbiddenIds),
      type: 'component-bounds-stitch-line-constraint-field',
      modelId: params.modelId,
      field: params.field,
    }
  }

  public createTPocketStitchLineConstraintField(
    params: Factory.ReadonlyCreateTPocketStitchLineConstraintFieldParamsSchema,
  ): TPocketStitchLineConstraintFieldSchema {
    return {
      id: this.id.get('t-pocket-stitch-line-constraint-field', params.forbiddenIds),
      type: 't-pocket-stitch-line-constraint-field',
      modelId: params.modelId,
      field: params.field,
    }
  }
}
