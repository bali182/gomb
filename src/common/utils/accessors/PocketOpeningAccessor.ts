import type { AccessorOwnerSchema, OptionalAccessorSchema, PocketOpeningAccessorSchema } from '../../schemas/accessors'
import type { PocketOpeningSchema } from '../../schemas/pocketOpening'
import { BaseStrictAccessor } from './BaseStrictAccessor'

export class PocketOpeningAccessor extends BaseStrictAccessor implements PocketOpeningAccessorSchema {
  constructor(
    private readonly optional: OptionalAccessorSchema<PocketOpeningAccessorSchema>,
    owner: AccessorOwnerSchema,
  ) {
    super(owner)
    this.byId = this.byId.bind(this)
    this.defaultOpening = this.defaultOpening.bind(this)
  }

  byId(id: string): PocketOpeningSchema {
    return this.requireResult(this.optional.byId(id), 'pocket opening')
  }

  defaultOpening(): PocketOpeningSchema {
    return this.requireResult(this.optional.defaultOpening(), 'default pocket opening')
  }
}
