import type { ComputedComponentAccessorSchema, OptionalAccessorSchema } from '../../schemas/accessors'
import type {
  ComputedComponentSchema,
  ComputedFrontPocketSchema,
  ComputedPanelSchema,
  ComputedPocketClusterSchema,
  ComputedPocketSchema,
  ComputedRootPanelSchema,
  ComputedTPocketSchema,
} from '../../schemas/computed'
import type { ComputedSubProjectSchema } from '../../schemas/subProject'
import { isDefined } from '../isDefined'
import { narrowers } from '../narrowers'

export class OptionalComputedComponentAccessor implements OptionalAccessorSchema<ComputedComponentAccessorSchema> {
  private readonly parents = new Map<string, ComputedComponentSchema>()

  constructor(private readonly root: ComputedSubProjectSchema) {
    for (const parent of Object.values(root.components)) {
      for (const child of parent.children) {
        const childId = child.componentId
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

  byId(id: string): ComputedComponentSchema | undefined {
    return this.root.components[id]
  }

  pocket(id: string): ComputedPocketSchema | undefined {
    const value = this.byId(id)
    return isDefined(value) && (narrowers.is.computedFrontPocket(value) || narrowers.is.computedTPocket(value))
      ? value
      : undefined
  }

  rootPanel(id: string = this.root.root): ComputedRootPanelSchema | undefined {
    const value = this.byId(id)
    return isDefined(value) && narrowers.is.computedRootPanel(value) ? value : undefined
  }

  panel(id: string): ComputedPanelSchema | undefined {
    const value = this.byId(id)
    return isDefined(value) && narrowers.is.computedPanel(value) ? value : undefined
  }

  pocketCluster(id: string): ComputedPocketClusterSchema | undefined {
    const value = this.byId(id)
    return isDefined(value) && narrowers.is.computedPocketCluster(value) ? value : undefined
  }

  tPocket(id: string): ComputedTPocketSchema | undefined {
    const value = this.byId(id)
    return isDefined(value) && narrowers.is.computedTPocket(value) ? value : undefined
  }

  frontPocket(id: string): ComputedFrontPocketSchema | undefined {
    const value = this.byId(id)
    return isDefined(value) && narrowers.is.computedFrontPocket(value) ? value : undefined
  }

  parent(id: string): ComputedComponentSchema | undefined {
    return this.parents.get(id)
  }
}
