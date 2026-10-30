import type { OptionalAccessorSchema, SubProjectLimitsAccessorSchema } from '../../schemas/accessors'
import type {
  ComponentLimitsSchema,
  HoleLimitsSchema,
  StitchLineLimitsSchema,
  SubProjectLimitsSchema,
} from '../../schemas/limits'

export class OptionalSubProjectLimitsAccessor implements OptionalAccessorSchema<SubProjectLimitsAccessorSchema> {
  constructor(private readonly limits: SubProjectLimitsSchema) {
    this.component = this.component.bind(this)
    this.hole = this.hole.bind(this)
    this.stitchLine = this.stitchLine.bind(this)
  }

  component(id: string): ComponentLimitsSchema | undefined {
    return this.limits.components[id]
  }

  hole(id: string): HoleLimitsSchema | undefined {
    return this.limits.holes[id]
  }

  stitchLine(id: string): StitchLineLimitsSchema | undefined {
    return this.limits.stitchLines[id]
  }
}
