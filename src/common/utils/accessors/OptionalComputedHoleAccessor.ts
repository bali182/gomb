import type { ComputedHoleAccessorSchema, OptionalAccessorSchema } from '../../schemas/accessors'
import type { ComputedHoleSchema } from '../../schemas/computed'
import type { ComputedSubProjectSchema } from '../../schemas/subProject'

export class OptionalComputedHoleAccessor implements OptionalAccessorSchema<ComputedHoleAccessorSchema> {
  constructor(private readonly root: ComputedSubProjectSchema) {
    this.byId = this.byId.bind(this)
  }

  byId(id: string): ComputedHoleSchema | undefined {
    return this.root.holes[id]
  }
}
