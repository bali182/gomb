import type { ComponentAccessorSchema, OptionalAccessorSchema } from '../../schemas/accessors'
import type {
  ComponentSchema,
  FrontPocketSchema,
  PanelSchema,
  PocketClusterSchema,
  PocketSchema,
  RootPanelSchema,
  TPocketSchema,
} from '../../schemas/components'
import type { SubProjectSchema } from '../../schemas/subProject'
import { isDefined } from '../isDefined'
import { narrowers } from '../narrowers'

export class OptionalComponentAccessor implements OptionalAccessorSchema<ComponentAccessorSchema> {
  private readonly parents = new Map<string, ComponentSchema>()

  constructor(private readonly root: SubProjectSchema) {
    for (const parent of Object.values(root.components)) {
      for (const childId of parent.children) {
        if (!this.parents.has(childId)) {
          this.parents.set(childId, parent)
        }
      }
    }
    this.byId = this.byId.bind(this)
    this.pocket = this.pocket.bind(this)
    this.rootPanel = this.rootPanel.bind(this)
    this.panel = this.panel.bind(this)
    this.pocketCluster = this.pocketCluster.bind(this)
    this.tPocket = this.tPocket.bind(this)
    this.frontPocket = this.frontPocket.bind(this)
    this.parent = this.parent.bind(this)
  }

  byId(id: string): ComponentSchema | undefined {
    return this.root.components[id]
  }

  pocket(id: string): PocketSchema | undefined {
    const value = this.byId(id)
    return isDefined(value) && narrowers.is.pocket(value) ? value : undefined
  }

  rootPanel(id: string = this.root.root): RootPanelSchema | undefined {
    const value = this.byId(id)
    return isDefined(value) && narrowers.is.rootPanel(value) ? value : undefined
  }

  panel(id: string): PanelSchema | undefined {
    const value = this.byId(id)
    return isDefined(value) && narrowers.is.panel(value) ? value : undefined
  }

  pocketCluster(id: string): PocketClusterSchema | undefined {
    const value = this.byId(id)
    return isDefined(value) && narrowers.is.pocketCluster(value) ? value : undefined
  }

  tPocket(id: string): TPocketSchema | undefined {
    const value = this.byId(id)
    return isDefined(value) && narrowers.is.tPocket(value) ? value : undefined
  }

  frontPocket(id: string): FrontPocketSchema | undefined {
    const value = this.byId(id)
    return isDefined(value) && narrowers.is.frontPocket(value) ? value : undefined
  }

  parent(id: string): ComponentSchema | undefined {
    return this.parents.get(id)
  }
}
