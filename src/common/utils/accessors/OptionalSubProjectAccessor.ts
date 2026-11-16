import type { OptionalSubProjectAccessorSchema } from '../../schemas/accessors'
import type { SubProjectSchema } from '../../schemas/subProject'
import { OptionalBindingAccessor } from './OptionalBindingAccessor'
import { OptionalComponentAccessor } from './OptionalComponentAccessor'
import { OptionalHoleAccessor } from './OptionalHoleAccessor'
import { OptionalPocketOpeningAccessor } from './OptionalPocketOpeningAccessor'
import { OptionalStitchLineAccessor } from './OptionalStitchLineAccessor'

export class OptionalSubProjectAccessor implements OptionalSubProjectAccessorSchema {
  readonly binding: OptionalBindingAccessor
  readonly pocketOpening: OptionalPocketOpeningAccessor
  readonly component: OptionalComponentAccessor
  readonly hole: OptionalHoleAccessor
  readonly stitchLine: OptionalStitchLineAccessor

  constructor(root: SubProjectSchema) {
    this.pocketOpening = new OptionalPocketOpeningAccessor(root)
    this.component = new OptionalComponentAccessor(root)
    this.hole = new OptionalHoleAccessor(root)
    this.stitchLine = new OptionalStitchLineAccessor(root, this.hole)
    this.binding = new OptionalBindingAccessor(root, this.component, this.hole, this.stitchLine, this.pocketOpening)
  }
}
