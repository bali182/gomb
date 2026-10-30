import type { AccessorOwnerSchema, ComputedSubProjectAccessorSchema } from '../../schemas/accessors'
import type { ComputedSubProjectSchema } from '../../schemas/subProject'
import { ComputedComponentAccessor } from './ComputedComponentAccessor'
import { ComputedHoleAccessor } from './ComputedHoleAccessor'
import { ComputedStitchLineAccessor } from './ComputedStitchLineAccessor'
import { OptionalComputedSubProjectAccessor } from './OptionalComputedSubProjectAccessor'
import { SubProjectLimitsAccessor } from './SubProjectLimitsAccessor'

export class ComputedSubProjectAccessor implements ComputedSubProjectAccessorSchema {
  readonly optional: OptionalComputedSubProjectAccessor
  readonly component: ComputedComponentAccessor
  readonly hole: ComputedHoleAccessor
  readonly stitchLine: ComputedStitchLineAccessor
  readonly limits: SubProjectLimitsAccessor

  constructor(public readonly root: ComputedSubProjectSchema) {
    const owner: AccessorOwnerSchema = { type: 'computed sub-project', id: root.id }
    this.optional = new OptionalComputedSubProjectAccessor(root)
    this.component = new ComputedComponentAccessor(this.optional.component, owner)
    this.hole = new ComputedHoleAccessor(this.optional.hole, owner)
    this.stitchLine = new ComputedStitchLineAccessor(this.optional.stitchLine, owner)
    this.limits = new SubProjectLimitsAccessor(this.optional.limits, owner)
  }
}
