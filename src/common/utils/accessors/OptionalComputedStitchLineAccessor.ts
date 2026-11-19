import type { ComputedStitchLineAccessorSchema, OptionalAccessorSchema } from '../../schemas/accessors'
import type { ComputedStitchLineSchema, ComputedStitchRouteSchema } from '../../schemas/computed'
import type { ComputedSubProjectSchema } from '../../schemas/subProject'
import { isDefined } from '../isDefined'

export class OptionalComputedStitchLineAccessor implements OptionalAccessorSchema<ComputedStitchLineAccessorSchema> {
  private readonly stitchLinesByOwner = new Map<string, ComputedStitchLineSchema[]>()
  private readonly routesByEntry = new Map<string, ComputedStitchRouteSchema[]>()
  private readonly routesByExit = new Map<string, ComputedStitchRouteSchema[]>()

  constructor(private readonly root: ComputedSubProjectSchema) {
    for (const stitchLine of Object.values(root.stitchLines)) {
      const ownerId = stitchLine.componentId
      const ownedStitchLines = this.stitchLinesByOwner.get(ownerId) ?? []
      ownedStitchLines.push(stitchLine)
      this.stitchLinesByOwner.set(ownerId, ownedStitchLines)
      for (const route of stitchLine.routes) {
        const entryRoutes = this.routesByEntry.get(route.entryComponentId) ?? []
        entryRoutes.push(route)
        this.routesByEntry.set(route.entryComponentId, entryRoutes)
        const exitRoutes = this.routesByExit.get(route.exitComponentId) ?? []
        exitRoutes.push(route)
        this.routesByExit.set(route.exitComponentId, exitRoutes)
      }
    }
    this.byId = this.byId.bind(this)
    this.bounds = this.bounds.bind(this)
    this.tPocket = this.tPocket.bind(this)
    this.byOwner = this.byOwner.bind(this)
    this.byEntry = this.byEntry.bind(this)
    this.byExit = this.byExit.bind(this)
  }

  byId(id: string): ComputedStitchLineSchema | undefined {
    return this.root.stitchLines[id]
  }

  bounds(id: string): ComputedStitchLineSchema | undefined {
    const value = this.byId(id)
    return isDefined(value) && value.type === 'component-bounds-stitch-line' ? value : undefined
  }

  tPocket(id: string): ComputedStitchLineSchema | undefined {
    const value = this.byId(id)
    return isDefined(value) && value.type === 't-pocket-stitch-line' ? value : undefined
  }

  byOwner(componentId: string): ComputedStitchLineSchema[] {
    return this.stitchLinesByOwner.get(componentId) ?? []
  }

  byEntry(componentId: string): ComputedStitchRouteSchema[] {
    return this.routesByEntry.get(componentId) ?? []
  }

  byExit(componentId: string): ComputedStitchRouteSchema[] {
    return this.routesByExit.get(componentId) ?? []
  }
}
