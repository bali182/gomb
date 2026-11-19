import type { AccessorOwnerSchema, OptionalAccessorSchema, StitchLineAccessorSchema } from '../../schemas/accessors'
import type { ComponentSchema, PocketClusterSchema } from '../../schemas/components'
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
    this.names = this.names.bind(this)
    this.byId = this.byId.bind(this)
    this.bounds = this.bounds.bind(this)
    this.tPocket = this.tPocket.bind(this)
    this.ownerPocketCluster = this.ownerPocketCluster.bind(this)
    this.byOwner = this.byOwner.bind(this)
    this.defaultEntryComponentId = this.defaultEntryComponentId.bind(this)
    this.defaultExitComponentId = this.defaultExitComponentId.bind(this)
    this.entryComponent = this.entryComponent.bind(this)
    this.exitComponent = this.exitComponent.bind(this)
  }

  names(): Set<string> {
    return this.optional.names()
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

  ownerPocketCluster(id: string): PocketClusterSchema {
    return this.requireResult(this.optional.ownerPocketCluster(id), 'pocket cluster')
  }

  byOwner(componentId: string): StitchLineSchema[] {
    return this.optional.byOwner(componentId)
  }

  defaultEntryComponentId(stitchLineId: string, pocketId?: string): string {
    return this.requireResult(this.optional.defaultEntryComponentId(stitchLineId, pocketId), 'default entry component')
  }

  defaultExitComponentId(stitchLineId: string): string {
    return this.requireResult(this.optional.defaultExitComponentId(stitchLineId), 'default exit component')
  }

  entryComponent(stitchLineId: string, pocketId?: string): ComponentSchema {
    return this.requireResult(this.optional.entryComponent(stitchLineId, pocketId), 'entry component')
  }

  exitComponent(stitchLineId: string): ComponentSchema {
    return this.requireResult(this.optional.exitComponent(stitchLineId), 'exit component')
  }
}
