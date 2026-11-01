import type { AccessorOwnerSchema, SubProjectAccessorSchema } from '../../schemas/accessors'
import type { SubProjectSchema } from '../../schemas/subProject'
import { ComponentAccessor } from './ComponentAccessor'
import { HoleAccessor } from './HoleAccessor'
import { OptionalSubProjectAccessor } from './OptionalSubProjectAccessor'
import { PocketOpeningAccessor } from './PocketOpeningAccessor'
import { StitchLineAccessor } from './StitchLineAccessor'

export class SubProjectAccessor implements SubProjectAccessorSchema {
  readonly pocketOpening: PocketOpeningAccessor
  readonly optional: OptionalSubProjectAccessor
  readonly component: ComponentAccessor
  readonly hole: HoleAccessor
  readonly stitchLine: StitchLineAccessor

  constructor(public readonly root: SubProjectSchema) {
    const owner: AccessorOwnerSchema = { type: 'sub-project', id: root.id }
    this.optional = new OptionalSubProjectAccessor(root)
    this.pocketOpening = new PocketOpeningAccessor(this.optional.pocketOpening, owner)
    this.component = new ComponentAccessor(this.optional.component, owner)
    this.hole = new HoleAccessor(this.optional.hole, owner)
    this.stitchLine = new StitchLineAccessor(this.optional.stitchLine, owner)
  }
}
