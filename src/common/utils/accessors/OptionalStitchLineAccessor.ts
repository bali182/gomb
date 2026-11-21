import type {
  ComponentAccessorSchema,
  HoleAccessorSchema,
  OptionalAccessorSchema,
  StitchLineAccessorSchema,
} from '../../schemas/accessors'
import type { ComponentSchema, PocketClusterSchema } from '../../schemas/components'
import type {
  ComponentBoundsStitchLineSchema,
  StitchLineSchema,
  TPocketStitchLineSchema,
} from '../../schemas/stitching'
import type { SubProjectSchema } from '../../schemas/subProject'
import { isDefined } from '../isDefined'
import { narrowers } from '../narrowers'

export class OptionalStitchLineAccessor implements OptionalAccessorSchema<StitchLineAccessorSchema> {
  private readonly stitchLines = new Map<string, StitchLineSchema>()
  private readonly stitchLinesByOwner = new Map<string, StitchLineSchema[]>()

  constructor(
    private readonly root: SubProjectSchema,
    private readonly holes: OptionalAccessorSchema<HoleAccessorSchema>,
    private readonly component: OptionalAccessorSchema<ComponentAccessorSchema>,
  ) {
    for (const stitchLine of root.stitchLines) {
      this.stitchLines.set(stitchLine.id, stitchLine)
      const ownerId = OptionalStitchLineAccessor.getOwnerId(stitchLine, holes)
      if (!isDefined(ownerId)) {
        continue
      }
      const ownedStitchLines = this.stitchLinesByOwner.get(ownerId) ?? []
      ownedStitchLines.push(stitchLine)
      this.stitchLinesByOwner.set(ownerId, ownedStitchLines)
    }
    this.names = this.names.bind(this)
    this.byId = this.byId.bind(this)
    this.bounds = this.bounds.bind(this)
    this.tPocket = this.tPocket.bind(this)
    this.ownerPocketCluster = this.ownerPocketCluster.bind(this)
    this.byOwner = this.byOwner.bind(this)
    this.defaultEntryComponentId = this.defaultEntryComponentId.bind(this)
    this.defaultExitComponentId = this.defaultExitComponentId.bind(this)
    this.entryComponent = this.entryComponent.bind(this)
    this.exitComponent = this.exitComponent.bind(this)
  }

  names(): Set<string> {
    return new Set(this.root.stitchLines.map((stitchLine) => stitchLine.name))
  }

  byId(id: string): StitchLineSchema | undefined {
    return this.stitchLines.get(id)
  }

  bounds(id: string): ComponentBoundsStitchLineSchema | undefined {
    const stitchLine = this.byId(id)
    return isDefined(stitchLine) && narrowers.is.componentBoundsStitchLine(stitchLine) ? stitchLine : undefined
  }

  tPocket(id: string): TPocketStitchLineSchema | undefined {
    const stitchLine = this.byId(id)
    return isDefined(stitchLine) && narrowers.is.tPocketStitchLine(stitchLine) ? stitchLine : undefined
  }

  ownerPocketCluster(id: string): PocketClusterSchema | undefined {
    const stitchLine = this.byId(id)
    if (!isDefined(stitchLine)) {
      return undefined
    }
    const ownerId = OptionalStitchLineAccessor.getOwnerId(stitchLine, this.holes)
    if (!isDefined(ownerId)) {
      return undefined
    }
    const owner = this.component.byId(ownerId)
    if (!isDefined(owner)) {
      return undefined
    }
    if (narrowers.is.pocketCluster(owner)) {
      return owner
    }
    const parent = this.component.parent(owner.id)
    return isDefined(parent) && narrowers.is.pocketCluster(parent) ? parent : undefined
  }

  byOwner(componentId: string): StitchLineSchema[] {
    return this.stitchLinesByOwner.get(componentId) ?? []
  }

  defaultEntryComponentId(stitchLineId: string, pocketId?: string): string | undefined {
    const stitchLine = this.byId(stitchLineId)
    if (!isDefined(stitchLine)) {
      return undefined
    }
    const ownerId = OptionalStitchLineAccessor.getOwnerId(stitchLine, this.holes)
    const owner = isDefined(ownerId) ? this.component.byId(ownerId) : undefined
    if (!isDefined(owner)) {
      return undefined
    }
    if (!narrowers.is.pocketCluster(owner)) {
      return owner.id
    }
    if (narrowers.is.tPocketStitchLine(stitchLine)) {
      return pocketId
    }
    return this.component.children(owner.id).find(narrowers.is.frontPocket)?.id
  }

  defaultExitComponentId(stitchLineId: string): string | undefined {
    const stitchLine = this.byId(stitchLineId)
    const root = this.component.rootPanel()
    if (!isDefined(stitchLine) || !isDefined(root)) {
      return undefined
    }
    const ownerId = OptionalStitchLineAccessor.getOwnerId(stitchLine, this.holes)
    const face = isDefined(ownerId) ? this.component.rootPanelFaceOf(ownerId) : undefined
    if (!isDefined(face)) {
      return undefined
    }
    if (narrowers.is.tPocketStitchLine(stitchLine)) {
      const cluster = this.ownerPocketCluster(stitchLineId)
      const parent = isDefined(cluster) ? this.component.parent(cluster.id) : undefined
      if (!isDefined(parent)) {
        return undefined
      }
      if (!narrowers.is.rootPanelFace(parent)) {
        return parent.id
      }
    }
    return face.id === root.frontFaceId ? root.backFaceId : root.frontFaceId
  }

  entryComponent(stitchLineId: string, pocketId?: string): ComponentSchema | undefined {
    const stitchLine = this.byId(stitchLineId)
    if (!isDefined(stitchLine)) {
      return undefined
    }
    const explicitId = narrowers.is.componentBoundsStitchLine(stitchLine) ? stitchLine.entryComponentId : undefined
    const id = explicitId ?? this.defaultEntryComponentId(stitchLineId, pocketId)
    return isDefined(id) ? this.component.byId(id) : undefined
  }

  exitComponent(stitchLineId: string): ComponentSchema | undefined {
    const stitchLine = this.byId(stitchLineId)
    if (!isDefined(stitchLine)) {
      return undefined
    }
    const id = stitchLine.exitComponentId ?? this.defaultExitComponentId(stitchLineId)
    return isDefined(id) ? this.component.byId(id) : undefined
  }

  private static getOwnerId(
    stitchLine: StitchLineSchema,
    holes: OptionalAccessorSchema<HoleAccessorSchema>,
  ): string | undefined {
    return stitchLine.targetType === 'component' ? stitchLine.targetId : holes.byId(stitchLine.targetId)?.componentId
  }
}
