import type { AccessorOwnerSchema, ComponentAccessorSchema, OptionalAccessorSchema } from '../../schemas/accessors'
import type {
  ComponentSchema,
  FrontPocketSchema,
  PanelSchema,
  PocketClusterSchema,
  PocketSchema,
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
    this.byId = this.byId.bind(this)
    this.pocket = this.pocket.bind(this)
    this.rootPanel = this.rootPanel.bind(this)
    this.panel = this.panel.bind(this)
    this.pocketCluster = this.pocketCluster.bind(this)
    this.tPocket = this.tPocket.bind(this)
    this.frontPocket = this.frontPocket.bind(this)
    this.parent = this.parent.bind(this)
  }

  byId(id: string): ComponentSchema {
    return this.requireResult(this.optional.byId(id), 'component')
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
}
