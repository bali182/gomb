import type {
  AccessorOwnerSchema,
  ComputedStitchLineAccessorSchema,
  OptionalAccessorSchema,
} from '../../schemas/accessors'
import type { ComputedStitchLineSchema, ComputedStitchRouteSchema } from '../../schemas/computed'
import { BaseStrictAccessor } from './BaseStrictAccessor'

export class ComputedStitchLineAccessor extends BaseStrictAccessor implements ComputedStitchLineAccessorSchema {
  constructor(
    private readonly optional: OptionalAccessorSchema<ComputedStitchLineAccessorSchema>,
    owner: AccessorOwnerSchema,
  ) {
    super(owner)
    this.byId = this.byId.bind(this)
    this.bounds = this.bounds.bind(this)
    this.tPocket = this.tPocket.bind(this)
    this.byOwner = this.byOwner.bind(this)
    this.byEntry = this.byEntry.bind(this)
    this.byExit = this.byExit.bind(this)
  }

  byId(id: string): ComputedStitchLineSchema {
    return this.requireResult(this.optional.byId(id), 'stitch line')
  }

  bounds(id: string): ComputedStitchLineSchema {
    return this.requireResult(this.optional.bounds(id), 'component bounds stitch line')
  }

  tPocket(id: string): ComputedStitchLineSchema {
    return this.requireResult(this.optional.tPocket(id), 't-pocket stitch line')
  }

  byOwner(componentId: string): ComputedStitchLineSchema[] {
    return this.optional.byOwner(componentId)
  }

  byEntry(componentId: string): ComputedStitchRouteSchema[] {
    return this.optional.byEntry(componentId)
  }

  byExit(componentId: string): ComputedStitchRouteSchema[] {
    return this.optional.byExit(componentId)
  }
}
