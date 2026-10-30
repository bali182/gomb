import type {
  AccessorOwnerSchema,
  ComputedComponentAccessorSchema,
  OptionalAccessorSchema,
} from '../../schemas/accessors'
import type {
  ComputedComponentSchema,
  ComputedFrontPocketSchema,
  ComputedPanelSchema,
  ComputedPocketClusterSchema,
  ComputedPocketSchema,
  ComputedRootPanelSchema,
  ComputedTPocketSchema,
} from '../../schemas/computed'
import { BaseStrictAccessor } from './BaseStrictAccessor'

export class ComputedComponentAccessor extends BaseStrictAccessor implements ComputedComponentAccessorSchema {
  constructor(
    private readonly optional: OptionalAccessorSchema<ComputedComponentAccessorSchema>,
    owner: AccessorOwnerSchema,
  ) {
    super(owner)
    this.byId = this.byId.bind(this)
    this.children = this.children.bind(this)
    this.pocket = this.pocket.bind(this)
    this.rootPanel = this.rootPanel.bind(this)
    this.panel = this.panel.bind(this)
    this.pocketCluster = this.pocketCluster.bind(this)
    this.tPocket = this.tPocket.bind(this)
    this.frontPocket = this.frontPocket.bind(this)
    this.parent = this.parent.bind(this)
  }

  byId(id: string): ComputedComponentSchema {
    return this.requireResult(this.optional.byId(id), 'component')
  }

  children(id: string): ComputedComponentSchema[] {
    return this.byId(id).children.map(this.byId)
  }

  pocket(id: string): ComputedPocketSchema {
    return this.requireResult(this.optional.pocket(id), 'pocket')
  }

  rootPanel(id?: string): ComputedRootPanelSchema {
    return this.requireResult(this.optional.rootPanel(id), 'root panel')
  }

  panel(id: string): ComputedPanelSchema {
    return this.requireResult(this.optional.panel(id), 'panel')
  }

  pocketCluster(id: string): ComputedPocketClusterSchema {
    return this.requireResult(this.optional.pocketCluster(id), 'pocket cluster')
  }

  tPocket(id: string): ComputedTPocketSchema {
    return this.requireResult(this.optional.tPocket(id), 't-pocket')
  }

  frontPocket(id: string): ComputedFrontPocketSchema {
    return this.requireResult(this.optional.frontPocket(id), 'front pocket')
  }

  parent(id: string): ComputedComponentSchema {
    return this.requireResult(this.optional.parent(id), 'parent')
  }
}
