import type {
  ComponentAccessorSchema,
  HoleAccessorSchema,
  OptionalAccessorSchema,
  StitchLineAccessorSchema,
} from '../../schemas/accessors'
import type { PocketClusterSchema } from '../../schemas/components'
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
  private readonly stitchLinesByOnTop = new Map<string, StitchLineSchema[]>()

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
      const onTopId = OptionalStitchLineAccessor.getOnTopId(root, stitchLine, ownerId)
      const ownedStitchLines = this.stitchLinesByOwner.get(ownerId) ?? []
      ownedStitchLines.push(stitchLine)
      this.stitchLinesByOwner.set(ownerId, ownedStitchLines)
      const onTopStitchLines = this.stitchLinesByOnTop.get(onTopId) ?? []
      onTopStitchLines.push(stitchLine)
      this.stitchLinesByOnTop.set(onTopId, onTopStitchLines)
    }
    this.names = this.names.bind(this)
    this.byId = this.byId.bind(this)
    this.bounds = this.bounds.bind(this)
    this.tPocket = this.tPocket.bind(this)
    this.ownerPocketCluster = this.ownerPocketCluster.bind(this)
    this.byOwner = this.byOwner.bind(this)
    this.byOnTop = this.byOnTop.bind(this)
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

  byOnTop(componentId: string): StitchLineSchema[] {
    return this.stitchLinesByOnTop.get(componentId) ?? []
  }

  private static getOwnerId(
    stitchLine: StitchLineSchema,
    holes: OptionalAccessorSchema<HoleAccessorSchema>,
  ): string | undefined {
    return stitchLine.targetType === 'component' ? stitchLine.targetId : holes.byId(stitchLine.targetId)?.componentId
  }

  private static getOnTopId(root: SubProjectSchema, stitchLine: StitchLineSchema, ownerId: string): string {
    if (
      narrowers.is.componentBoundsStitchLine(stitchLine) &&
      isDefined(stitchLine.onTop) &&
      isDefined(root.components[stitchLine.onTop])
    ) {
      return stitchLine.onTop
    }
    return ownerId
  }
}
