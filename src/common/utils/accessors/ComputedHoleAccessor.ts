import type { AccessorOwnerSchema, ComputedHoleAccessorSchema, OptionalAccessorSchema } from '../../schemas/accessors'
import type { ComputedHoleSchema } from '../../schemas/computed'
import { BaseStrictAccessor } from './BaseStrictAccessor'

export class ComputedHoleAccessor extends BaseStrictAccessor implements ComputedHoleAccessorSchema {
  constructor(
    private readonly optional: OptionalAccessorSchema<ComputedHoleAccessorSchema>,
    owner: AccessorOwnerSchema,
  ) {
    super(owner)
    this.byId = this.byId.bind(this)
  }

  byId(id: string): ComputedHoleSchema {
    return this.requireResult(this.optional.byId(id), 'hole')
  }
}
