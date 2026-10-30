import type { AccessorOwnerSchema, OptionalAccessorSchema, StitchLineAccessorSchema } from '../../schemas/accessors'
import type {
  ComponentBoundsStitchLineSchema,
  StitchLineSchema,
  TPocketStitchLineSchema,
} from '../../schemas/stitching'
import { BaseStrictAccessor } from './BaseStrictAccessor'

export class StitchLineAccessor extends BaseStrictAccessor implements StitchLineAccessorSchema {
  constructor(
    private readonly optional: OptionalAccessorSchema<StitchLineAccessorSchema>,
    owner: AccessorOwnerSchema,
  ) {
    super(owner)
    this.byId = this.byId.bind(this)
    this.bounds = this.bounds.bind(this)
    this.tPocket = this.tPocket.bind(this)
    this.byOwner = this.byOwner.bind(this)
    this.byOnTop = this.byOnTop.bind(this)
  }

  byId(id: string): StitchLineSchema {
    return this.requireResult(this.optional.byId(id), 'stitch line')
  }

  bounds(id: string): ComponentBoundsStitchLineSchema {
    return this.requireResult(this.optional.bounds(id), 'component bounds stitch line')
  }

  tPocket(id: string): TPocketStitchLineSchema {
    return this.requireResult(this.optional.tPocket(id), 't-pocket stitch line')
  }

  byOwner(componentId: string): StitchLineSchema[] {
    return this.optional.byOwner(componentId)
  }

  byOnTop(componentId: string): StitchLineSchema[] {
    return this.optional.byOnTop(componentId)
  }
}
