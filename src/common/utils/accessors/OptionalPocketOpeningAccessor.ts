import type { OptionalAccessorSchema, PocketOpeningAccessorSchema } from '../../schemas/accessors'
import type { PocketOpeningSchema } from '../../schemas/pocketOpening'
import type { SubProjectSchema } from '../../schemas/subProject'

export class OptionalPocketOpeningAccessor implements OptionalAccessorSchema<PocketOpeningAccessorSchema> {
  constructor(private readonly root: SubProjectSchema) {
    this.byId = this.byId.bind(this)
    this.defaultOpening = this.defaultOpening.bind(this)
  }

  byId(id: string): PocketOpeningSchema | undefined {
    return Object.prototype.hasOwnProperty.call(this.root.pocketOpenings, id) ? this.root.pocketOpenings[id] : undefined
  }

  defaultOpening(): PocketOpeningSchema | undefined {
    return this.byId(this.root.defaultPocketOpening)
  }
}
