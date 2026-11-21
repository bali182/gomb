import type { ComponentAccessorSchema, OptionalAccessorSchema } from '../../schemas/accessors'
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
import type { SubProjectSchema } from '../../schemas/subProject'
import { isDefined } from '../isDefined'
import { narrowers } from '../narrowers'

export class OptionalComponentAccessor implements OptionalAccessorSchema<ComponentAccessorSchema> {
  private readonly parents = new Map<string, ComponentSchema>()
  private readonly layerOrders = new Map<string, readonly string[]>()
  private readonly allComponents: ComponentSchema[]

  constructor(private readonly root: SubProjectSchema) {
    this.allComponents = Object.values(root.components)
    for (const parent of this.allComponents) {
      for (const childId of this.childIds(parent.id)) {
        if (!this.parents.has(childId)) {
          this.parents.set(childId, parent)
        }
      }
    }
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
    return this.layerIds(faceId).map(this.byId).filter(isDefined)
  }

  layerIds(faceId: string): readonly string[] {
    const cached = this.layerOrders.get(faceId)
    if (isDefined(cached)) {
      return cached
    }
    const root = this.rootPanel()
    const face = this.rootPanelFace(faceId)
    if (!isDefined(root) || !isDefined(face) || (faceId !== root.frontFaceId && faceId !== root.backFaceId)) {
      return []
    }
    const oppositeFaceId = faceId === root.frontFaceId ? root.backFaceId : root.frontFaceId
    const own = this.descendants(faceId).filter(
      (component) => !narrowers.is.pocketCluster(component) && !narrowers.is.guide(component),
    )
    const opposite = this.descendants(oppositeFaceId).filter(
      (component) => !narrowers.is.pocketCluster(component) && !narrowers.is.guide(component),
    )
    const ids = [
      ...opposite.reverse().map((component) => component.id),
      root.id,
      ...own.map((component) => component.id),
    ]
    this.layerOrders.set(faceId, ids)
    return ids
  }

  names(): Set<string> {
    return new Set(this.allComponents.map((component) => component.name))
  }

  byId(id: string): ComponentSchema | undefined {
    return this.root.components[id]
  }

  children(id: string): ComponentSchema[] {
    return this.childIds(id).map(this.byId).filter(isDefined)
  }

  childIds(id: string): string[] {
    const component = this.byId(id)
    if (!isDefined(component)) {
      return []
    }
    if (narrowers.is.rootPanel(component)) {
      if (
        component.frontFaceId === component.backFaceId ||
        !isDefined(this.rootPanelFace(component.frontFaceId)) ||
        !isDefined(this.rootPanelFace(component.backFaceId))
      ) {
        throw new Error('Invalid root panel faces')
      }
      return [component.frontFaceId, component.backFaceId]
    }
    return component.children
  }

  rootPanelFace(id: string): RootPanelFaceSchema | undefined {
    const value = this.byId(id)
    return isDefined(value) && narrowers.is.rootPanelFace(value) ? value : undefined
  }

  rootPanelFaceOf(id: string): RootPanelFaceSchema | undefined {
    let component = this.byId(id)
    const visited = new Set<string>()
    while (isDefined(component)) {
      if (narrowers.is.rootPanelFace(component)) {
        return component
      }
      const componentId = component.id
      if (visited.has(componentId)) {
        return undefined
      }
      visited.add(componentId)
      component = this.parent(componentId)
    }
    return undefined
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

  guide(id: string): GuideSchema | undefined {
    const value = this.byId(id)
    return isDefined(value) && narrowers.is.guide(value) ? value : undefined
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

  ancestors(id: string, includeSelf = false): readonly ComponentSchema[] {
    return this.ancestorIds(id, includeSelf).map(this.byId).filter(isDefined)
  }

  ancestorIds(id: string, includeSelf = false): readonly string[] {
    const ancestorIds: string[] = includeSelf ? [id] : []
    const visited = new Set<string>([id])
    let parent = this.parent(id)

    while (isDefined(parent) && !visited.has(parent.id)) {
      ancestorIds.push(parent.id)
      visited.add(parent.id)
      parent = this.parent(parent.id)
    }

    return ancestorIds
  }

  descendants(id: string, includeSelf = false): readonly ComponentSchema[] {
    return this.descendantIds(id, includeSelf).map(this.byId).filter(isDefined)
  }

  descendantIds(id: string, includeSelf = false): readonly string[] {
    const descendantIds: string[] = includeSelf ? [id] : []
    const visited = new Set<string>([id])
    const pendingIds = [...this.childIds(id)].reverse()

    while (pendingIds.length > 0) {
      const childId = pendingIds.pop()
      if (!isDefined(childId) || visited.has(childId)) {
        continue
      }
      visited.add(childId)
      descendantIds.push(childId)
      const childIds = this.childIds(childId)
      for (let index = childIds.length - 1; index >= 0; index--) {
        pendingIds.push(childIds[index])
      }
    }

    return descendantIds
  }

  components(): readonly ComponentSchema[] {
    return this.allComponents
  }

  pockets(): readonly PocketSchema[] {
    return this.allComponents.filter(narrowers.is.pocket)
  }

  tPockets(): readonly TPocketSchema[] {
    return this.allComponents.filter(narrowers.is.tPocket)
  }

  frontPockets(): readonly FrontPocketSchema[] {
    return this.allComponents.filter(narrowers.is.frontPocket)
  }

  panels(): readonly PanelSchema[] {
    return this.allComponents.filter(narrowers.is.panel)
  }

  guides(): readonly GuideSchema[] {
    return this.allComponents.filter(narrowers.is.guide)
  }

  pocketClusters(): readonly PocketClusterSchema[] {
    return this.allComponents.filter(narrowers.is.pocketCluster)
  }
}
