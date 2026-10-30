import type { ComputedStitchLineAccessorSchema, OptionalAccessorSchema } from '../../schemas/accessors'
import type { ComputedStitchLineSchema } from '../../schemas/computed'
import type { ComputedSubProjectSchema } from '../../schemas/subProject'
import { isDefined } from '../isDefined'

export class OptionalComputedStitchLineAccessor implements OptionalAccessorSchema<ComputedStitchLineAccessorSchema> {
  private readonly stitchLinesByOwner = new Map<string, ComputedStitchLineSchema[]>()
  private readonly stitchLinesByOnTop = new Map<string, ComputedStitchLineSchema[]>()

  constructor(private readonly root: ComputedSubProjectSchema) {
    for (const stitchLine of Object.values(root.stitchLines)) {
      const ownerId = stitchLine.componentId
      const onTopId = stitchLine.onTop
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

  byOnTop(componentId: string): ComputedStitchLineSchema[] {
    return this.stitchLinesByOnTop.get(componentId) ?? []
  }
}
