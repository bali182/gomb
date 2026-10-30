import type { ComputedProjectAccessorSchema } from '../../schemas/accessors'
import type { ComputedProjectSchema } from '../../schemas/project'
import type { ComputedSubProjectSchema } from '../../schemas/subProject'
import { BaseStrictAccessor } from './BaseStrictAccessor'
import { OptionalComputedProjectAccessor } from './OptionalComputedProjectAccessor'

export class ComputedProjectAccessor extends BaseStrictAccessor implements ComputedProjectAccessorSchema {
  readonly optional: OptionalComputedProjectAccessor

  constructor(public readonly root: ComputedProjectSchema) {
    super({ type: 'computed project', id: root.id, name: root.name })
    this.optional = new OptionalComputedProjectAccessor(root)
    this.subProject = this.subProject.bind(this)
  }

  subProject(id: string): ComputedSubProjectSchema {
    return this.requireResult(this.optional.subProject(id), 'sub-project')
  }
}
