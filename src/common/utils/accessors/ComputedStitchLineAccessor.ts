import type {
  AccessorOwnerSchema,
  ComputedStitchLineAccessorSchema,
  OptionalAccessorSchema,
} from '../../schemas/accessors'
import type { ComputedStitchLineSchema } from '../../schemas/computed'
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
    this.byOnTop = this.byOnTop.bind(this)
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

  byOnTop(componentId: string): ComputedStitchLineSchema[] {
    return this.optional.byOnTop(componentId)
  }
}
