import type { OptionalAccessorSchema, PocketOpeningAccessorSchema } from '../../schemas/accessors'
import type { PocketOpeningSchema } from '../../schemas/pocketOpening'
import type { SubProjectSchema } from '../../schemas/subProject'
import { has } from '../has'

export class OptionalPocketOpeningAccessor implements OptionalAccessorSchema<PocketOpeningAccessorSchema> {
  private readonly allPocketOpenings: PocketOpeningSchema[]

  constructor(private readonly root: SubProjectSchema) {
    this.allPocketOpenings = Object.values(root.pocketOpenings)
    this.byId = this.byId.bind(this)
    this.defaultOpening = this.defaultOpening.bind(this)
  }

  byId(id: string): PocketOpeningSchema | undefined {
    return has(this.root.pocketOpenings, id) ? this.root.pocketOpenings[id] : undefined
  }

  defaultOpening(): PocketOpeningSchema | undefined {
    return this.byId(this.root.defaultPocketOpening)
  }

  pocketOpenings(): readonly PocketOpeningSchema[] {
    return this.allPocketOpenings
  }
}
