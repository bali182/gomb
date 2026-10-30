import type { HoleAccessorSchema, OptionalAccessorSchema } from '../../schemas/accessors'
import type { HoleSchema } from '../../schemas/hole'
import type { SubProjectSchema } from '../../schemas/subProject'

export class OptionalHoleAccessor implements OptionalAccessorSchema<HoleAccessorSchema> {
  private readonly holes = new Map<string, HoleSchema>()

  constructor(root: SubProjectSchema) {
    for (const hole of root.holes) {
      if (!this.holes.has(hole.id)) {
        this.holes.set(hole.id, hole)
      }
    }
    this.byId = this.byId.bind(this)
  }

  byId(id: string): HoleSchema | undefined {
    return this.holes.get(id)
  }
}
