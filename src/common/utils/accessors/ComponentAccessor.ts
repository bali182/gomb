import type { AccessorOwnerSchema, ComponentAccessorSchema, OptionalAccessorSchema } from '../../schemas/accessors'
import type {
  ComponentSchema,
  FrontPocketSchema,
  GuideSchema,
  PanelSchema,
  PocketClusterSchema,
  PocketSchema,
  RootPanelFaceSchema,
  RootPanelSchema,
  TPocketSchema,
} from '../../schemas/components'
import { BaseStrictAccessor } from './BaseStrictAccessor'

export class ComponentAccessor extends BaseStrictAccessor implements ComponentAccessorSchema {
  constructor(
    private readonly optional: OptionalAccessorSchema<ComponentAccessorSchema>,
    owner: AccessorOwnerSchema,
  ) {
    super(owner)
    this.layers = this.layers.bind(this)
    this.layerIds = this.layerIds.bind(this)
    this.names = this.names.bind(this)
    this.byId = this.byId.bind(this)
    this.children = this.children.bind(this)
    this.childIds = this.childIds.bind(this)
    this.rootPanelFace = this.rootPanelFace.bind(this)
    this.rootPanelFaceOf = this.rootPanelFaceOf.bind(this)
    this.pocket = this.pocket.bind(this)
    this.rootPanel = this.rootPanel.bind(this)
    this.panel = this.panel.bind(this)
    this.guide = this.guide.bind(this)
    this.pocketCluster = this.pocketCluster.bind(this)
    this.tPocket = this.tPocket.bind(this)
    this.frontPocket = this.frontPocket.bind(this)
    this.parent = this.parent.bind(this)
    this.ancestors = this.ancestors.bind(this)
    this.ancestorIds = this.ancestorIds.bind(this)
    this.descendants = this.descendants.bind(this)
    this.descendantIds = this.descendantIds.bind(this)
    this.pockets = this.pockets.bind(this)
    this.tPockets = this.tPockets.bind(this)
    this.frontPockets = this.frontPockets.bind(this)
    this.panels = this.panels.bind(this)
    this.guides = this.guides.bind(this)
    this.pocketClusters = this.pocketClusters.bind(this)
  }

  layers(faceId: string): readonly ComponentSchema[] {
    return this.layerIds(faceId).map(this.byId)
  }

  layerIds(faceId: string): readonly string[] {
    this.rootPanelFace(faceId)
    return this.optional.layerIds(faceId)
  }

  names(): Set<string> {
    return this.optional.names()
  }

  byId(id: string): ComponentSchema {
    return this.requireResult(this.optional.byId(id), 'component')
  }

  children(id: string): ComponentSchema[] {
    return this.childIds(id).map(this.byId)
  }

  childIds(id: string): string[] {
    this.byId(id)
    return this.optional.childIds(id)
  }
  rootPanelFace(id: string): RootPanelFaceSchema {
    return this.requireResult(this.optional.rootPanelFace(id), 'root panel face')
  }
  rootPanelFaceOf(id: string): RootPanelFaceSchema {
    return this.requireResult(this.optional.rootPanelFaceOf(id), 'root panel face')
  }

  pocket(id: string): PocketSchema {
    return this.requireResult(this.optional.pocket(id), 'pocket')
  }

  rootPanel(id?: string): RootPanelSchema {
    return this.requireResult(this.optional.rootPanel(id), 'root panel')
  }

  panel(id: string): PanelSchema {
    return this.requireResult(this.optional.panel(id), 'panel')
  }

  guide(id: string): GuideSchema {
    return this.requireResult(this.optional.guide(id), 'guide')
  }

  pocketCluster(id: string): PocketClusterSchema {
    return this.requireResult(this.optional.pocketCluster(id), 'pocket cluster')
  }

  tPocket(id: string): TPocketSchema {
    return this.requireResult(this.optional.tPocket(id), 't-pocket')
  }

  frontPocket(id: string): FrontPocketSchema {
    return this.requireResult(this.optional.frontPocket(id), 'front pocket')
  }

  parent(id: string): ComponentSchema {
    return this.requireResult(this.optional.parent(id), 'parent')
  }

  ancestors(id: string, includeSelf = false): readonly ComponentSchema[] {
    this.byId(id)
    return this.ancestorIds(id, includeSelf).map(this.byId)
  }

  ancestorIds(id: string, includeSelf = false): readonly string[] {
    return this.optional.ancestorIds(id, includeSelf)
  }

  descendants(id: string, includeSelf = false): readonly ComponentSchema[] {
    this.byId(id)
    return this.descendantIds(id, includeSelf).map(this.byId)
  }

  descendantIds(id: string, includeSelf = false): readonly string[] {
    return this.optional.descendantIds(id, includeSelf)
  }

  components(): readonly ComponentSchema[] {
    return this.optional.components()
  }

  pockets(): readonly PocketSchema[] {
    return this.optional.pockets()
  }

  tPockets(): readonly TPocketSchema[] {
    return this.optional.tPockets()
  }

  frontPockets(): readonly FrontPocketSchema[] {
    return this.optional.frontPockets()
  }

  panels(): readonly PanelSchema[] {
    return this.optional.panels()
  }

  guides(): readonly GuideSchema[] {
    return this.optional.guides()
  }

  pocketClusters(): readonly PocketClusterSchema[] {
    return this.optional.pocketClusters()
  }
}
