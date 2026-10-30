import type { OptionalComputedSubProjectAccessorSchema } from '../../schemas/accessors'
import type { ComputedSubProjectSchema } from '../../schemas/subProject'
import { OptionalComputedComponentAccessor } from './OptionalComputedComponentAccessor'
import { OptionalComputedHoleAccessor } from './OptionalComputedHoleAccessor'
import { OptionalComputedStitchLineAccessor } from './OptionalComputedStitchLineAccessor'
import { OptionalSubProjectLimitsAccessor } from './OptionalSubProjectLimitsAccessor'

export class OptionalComputedSubProjectAccessor implements OptionalComputedSubProjectAccessorSchema {
  readonly component: OptionalComputedComponentAccessor
  readonly hole: OptionalComputedHoleAccessor
  readonly stitchLine: OptionalComputedStitchLineAccessor
  readonly limits: OptionalSubProjectLimitsAccessor

  constructor(root: ComputedSubProjectSchema) {
    this.component = new OptionalComputedComponentAccessor(root)
    this.hole = new OptionalComputedHoleAccessor(root)
    this.stitchLine = new OptionalComputedStitchLineAccessor(root)
    this.limits = new OptionalSubProjectLimitsAccessor(root.limits)
  }
}
