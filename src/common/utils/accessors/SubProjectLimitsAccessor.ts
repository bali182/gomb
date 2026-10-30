import type {
  AccessorOwnerSchema,
  OptionalAccessorSchema,
  SubProjectLimitsAccessorSchema,
} from '../../schemas/accessors'
import type { ComponentLimitsSchema, HoleLimitsSchema, StitchLineLimitsSchema } from '../../schemas/limits'
import { BaseStrictAccessor } from './BaseStrictAccessor'

export class SubProjectLimitsAccessor extends BaseStrictAccessor implements SubProjectLimitsAccessorSchema {
  constructor(
    private readonly optional: OptionalAccessorSchema<SubProjectLimitsAccessorSchema>,
    owner: AccessorOwnerSchema,
  ) {
    super(owner)
    this.component = this.component.bind(this)
    this.hole = this.hole.bind(this)
    this.stitchLine = this.stitchLine.bind(this)
  }

  component(id: string): ComponentLimitsSchema {
    return this.requireResult(this.optional.component(id), 'component limits')
  }

  hole(id: string): HoleLimitsSchema {
    return this.requireResult(this.optional.hole(id), 'hole limits')
  }

  stitchLine(id: string): StitchLineLimitsSchema {
    return this.requireResult(this.optional.stitchLine(id), 'stitch line limits')
  }
}
