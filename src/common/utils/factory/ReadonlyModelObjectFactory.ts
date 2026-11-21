import {
  defaultComponentBoundsStitchLine,
  defaultFrontPocket,
  defaultHole,
  defaultOpticalIllusionPocketOpening,
  defaultPanel,
  defaultPocketCluster,
  defaultRecessedPocketOpening,
  defaultRootPanel,
  defaultRootPanelFace,
  defaultSlantedPocketOpening,
  defaultTPocket,
  defaultTPocketStitchLine,
} from '../../defaultStates'
import { getClosestPocketStepSize, getClosestRootDimensions } from '../../operations/subProject/utils/dimensionUtils'
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
  RootPanelFaceBindingFieldSchema,
  SlantedPocketOpeningBindingFieldSchema,
  TPocketBindingFieldSchema,
  TPocketStitchLineBindingFieldSchema,
} from '../../schemas/bindings'
import type {
  ComponentSchema,
  FrontPocketSchema,
  PanelSchema,
  PocketClusterSchema,
  RootPanelFaceSchema,
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
import { isDefined } from '../isDefined'

export class ReadonlyModelObjectFactory implements Factory.ReadonlyModelObjectFactorySchema {
  constructor(
    private readonly id: IdGeneratorSchema,
    private readonly name: NameGeneratorSchema,
  ) {}

  public createComponent(params: Factory.ReadonlyCreateComponentParamsSchema): ComponentSchema {
    switch (params.type) {
      case 'root-panel': {
        if (!isDefined(params.frontFaceId) || !isDefined(params.backFaceId)) {
          throw new Error('Root panel face IDs are required')
        }
        return this.createRootPanel({ ...params, frontFaceId: params.frontFaceId, backFaceId: params.backFaceId })
      }
      case 'root-panel-face': {
        if (!isDefined(params.name)) {
          throw new Error('A name is required to create a root panel face')
        }
        return this.createRootPanelFace({ ...params, name: params.name })
      }
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
      frontFaceId: params.frontFaceId,
      backFaceId: params.backFaceId,
      id: this.id.get('root-panel', params.forbiddenIds),
      name: this.name.get('root-panel', params.forbiddenNames),
      ...getClosestRootDimensions(defaultRootPanel, params.stitchingSettings),
      ...(isDefined(params.color) ? { color: params.color } : {}),
    }
  }

  public createRootPanelFace(params: Factory.ReadonlyCreateRootPanelFaceParamsSchema): RootPanelFaceSchema {
    return {
      ...defaultRootPanelFace,
      children: [],
      id: this.id.get('root-panel-face', params.forbiddenIds),
      name: params.name,
    }
  }
  public createRootPanelFaceBindingField(
    params: Factory.ReadonlyCreateRootPanelFaceBindingFieldParamsSchema,
  ): RootPanelFaceBindingFieldSchema {
    return {
      type: 'root-panel-face-binding-field',
      id: this.id.get('root-panel-face-binding-field', params.forbiddenIds),
      modelId: params.modelId,
      field: params.field,
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

  public createBinding(params: Factory.ReadonlyCreateBindingParamsSchema): BindingSchema {
    switch (params.type) {
      case 'equal-binding':
        return this.createEqualBinding(params)
    }
  }

  public createEqualBinding(params: Factory.ReadonlyCreateEqualBindingParamsSchema): EqualBindingSchema {
    return { id: this.id.get('equal-binding', params.forbiddenIds), type: 'equal-binding', fields: [] }
  }

  public createBindingField(params: Factory.ReadonlyCreateBindingFieldParamsSchema): BindingFieldSchema {
    switch (params.type) {
      case 'root-panel-face-binding-field':
        return this.createRootPanelFaceBindingField(params)
      case 'root-panel-binding-field':
        return this.createRootPanelBindingField(params)
      case 'panel-binding-field':
        return this.createPanelBindingField(params)
      case 'pocket-cluster-binding-field':
        return this.createPocketClusterBindingField(params)
      case 'front-pocket-binding-field':
        return this.createFrontPocketBindingField(params)
      case 't-pocket-binding-field':
        return this.createTPocketBindingField(params)
      case 'hole-binding-field':
        return this.createHoleBindingField(params)
      case 'recessed-binding-field':
        return this.createRecessedPocketOpeningBindingField(params)
      case 'slanted-binding-field':
        return this.createSlantedPocketOpeningBindingField(params)
      case 'optical-illusion-binding-field':
        return this.createOpticalIllusionPocketOpeningBindingField(params)
      case 'component-bounds-stitch-line-binding-field':
        return this.createComponentBoundsStitchLineBindingField(params)
      case 't-pocket-stitch-line-binding-field':
        return this.createTPocketStitchLineBindingField(params)
    }
  }

  public createRootPanelBindingField(
    params: Factory.ReadonlyCreateRootPanelBindingFieldParamsSchema,
  ): RootPanelBindingFieldSchema {
    return {
      id: this.id.get('root-panel-binding-field', params.forbiddenIds),
      type: 'root-panel-binding-field',
      modelId: params.modelId,
      field: params.field,
    }
  }

  public createPanelBindingField(params: Factory.ReadonlyCreatePanelBindingFieldParamsSchema): PanelBindingFieldSchema {
    return {
      id: this.id.get('panel-binding-field', params.forbiddenIds),
      type: 'panel-binding-field',
      modelId: params.modelId,
      field: params.field,
    }
  }

  public createPocketClusterBindingField(
    params: Factory.ReadonlyCreatePocketClusterBindingFieldParamsSchema,
  ): PocketClusterBindingFieldSchema {
    return {
      id: this.id.get('pocket-cluster-binding-field', params.forbiddenIds),
      type: 'pocket-cluster-binding-field',
      modelId: params.modelId,
      field: params.field,
    }
  }

  public createFrontPocketBindingField(
    params: Factory.ReadonlyCreateFrontPocketBindingFieldParamsSchema,
  ): FrontPocketBindingFieldSchema {
    return {
      id: this.id.get('front-pocket-binding-field', params.forbiddenIds),
      type: 'front-pocket-binding-field',
      modelId: params.modelId,
      field: params.field,
    }
  }

  public createTPocketBindingField(
    params: Factory.ReadonlyCreateTPocketBindingFieldParamsSchema,
  ): TPocketBindingFieldSchema {
    return {
      id: this.id.get('t-pocket-binding-field', params.forbiddenIds),
      type: 't-pocket-binding-field',
      modelId: params.modelId,
      field: params.field,
    }
  }

  public createHoleBindingField(params: Factory.ReadonlyCreateHoleBindingFieldParamsSchema): HoleBindingFieldSchema {
    return {
      id: this.id.get('hole-binding-field', params.forbiddenIds),
      type: 'hole-binding-field',
      modelId: params.modelId,
      field: params.field,
    }
  }

  public createRecessedPocketOpeningBindingField(
    params: Factory.ReadonlyCreateRecessedPocketOpeningBindingFieldParamsSchema,
  ): RecessedPocketOpeningBindingFieldSchema {
    return {
      id: this.id.get('recessed-binding-field', params.forbiddenIds),
      type: 'recessed-binding-field',
      modelId: params.modelId,
      field: params.field,
    }
  }

  public createSlantedPocketOpeningBindingField(
    params: Factory.ReadonlyCreateSlantedPocketOpeningBindingFieldParamsSchema,
  ): SlantedPocketOpeningBindingFieldSchema {
    return {
      id: this.id.get('slanted-binding-field', params.forbiddenIds),
      type: 'slanted-binding-field',
      modelId: params.modelId,
      field: params.field,
    }
  }

  public createOpticalIllusionPocketOpeningBindingField(
    params: Factory.ReadonlyCreateOpticalIllusionPocketOpeningBindingFieldParamsSchema,
  ): OpticalIllusionPocketOpeningBindingFieldSchema {
    return {
      id: this.id.get('optical-illusion-binding-field', params.forbiddenIds),
      type: 'optical-illusion-binding-field',
      modelId: params.modelId,
      field: params.field,
    }
  }

  public createComponentBoundsStitchLineBindingField(
    params: Factory.ReadonlyCreateComponentBoundsStitchLineBindingFieldParamsSchema,
  ): ComponentBoundsStitchLineBindingFieldSchema {
    return {
      id: this.id.get('component-bounds-stitch-line-binding-field', params.forbiddenIds),
      type: 'component-bounds-stitch-line-binding-field',
      modelId: params.modelId,
      field: params.field,
    }
  }

  public createTPocketStitchLineBindingField(
    params: Factory.ReadonlyCreateTPocketStitchLineBindingFieldParamsSchema,
  ): TPocketStitchLineBindingFieldSchema {
    return {
      id: this.id.get('t-pocket-stitch-line-binding-field', params.forbiddenIds),
      type: 't-pocket-stitch-line-binding-field',
      modelId: params.modelId,
      field: params.field,
    }
  }
}
