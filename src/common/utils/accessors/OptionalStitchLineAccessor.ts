import type { HoleAccessorSchema, OptionalAccessorSchema, StitchLineAccessorSchema } from '../../schemas/accessors'
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

  constructor(root: SubProjectSchema, holes: OptionalAccessorSchema<HoleAccessorSchema>) {
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
    this.byId = this.byId.bind(this)
    this.bounds = this.bounds.bind(this)
    this.tPocket = this.tPocket.bind(this)
    this.byOwner = this.byOwner.bind(this)
    this.byOnTop = this.byOnTop.bind(this)
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
