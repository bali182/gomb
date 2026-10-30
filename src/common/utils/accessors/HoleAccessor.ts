import type { AccessorOwnerSchema, HoleAccessorSchema, OptionalAccessorSchema } from '../../schemas/accessors'
import type { HoleSchema } from '../../schemas/hole'
import { BaseStrictAccessor } from './BaseStrictAccessor'

export class HoleAccessor extends BaseStrictAccessor implements HoleAccessorSchema {
  constructor(
    private readonly optional: OptionalAccessorSchema<HoleAccessorSchema>,
    owner: AccessorOwnerSchema,
  ) {
    super(owner)
    this.byId = this.byId.bind(this)
  }

  byId(id: string): HoleSchema {
    return this.requireResult(this.optional.byId(id), 'hole')
  }
}
