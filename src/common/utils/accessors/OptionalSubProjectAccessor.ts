import type { OptionalSubProjectAccessorSchema } from '../../schemas/accessors'
import type { SubProjectSchema } from '../../schemas/subProject'
import { OptionalComponentAccessor } from './OptionalComponentAccessor'
import { OptionalHoleAccessor } from './OptionalHoleAccessor'
import { OptionalPocketOpeningAccessor } from './OptionalPocketOpeningAccessor'
import { OptionalStitchLineAccessor } from './OptionalStitchLineAccessor'

export class OptionalSubProjectAccessor implements OptionalSubProjectAccessorSchema {
  readonly pocketOpening: OptionalPocketOpeningAccessor
  readonly component: OptionalComponentAccessor
  readonly hole: OptionalHoleAccessor
  readonly stitchLine: OptionalStitchLineAccessor

  constructor(root: SubProjectSchema) {
    this.pocketOpening = new OptionalPocketOpeningAccessor(root)
    this.component = new OptionalComponentAccessor(root)
    this.hole = new OptionalHoleAccessor(root)
    this.stitchLine = new OptionalStitchLineAccessor(root, this.hole)
  }
}
