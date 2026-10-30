import type { ProjectAccessorSchema } from '../../schemas/accessors'
import type { ProjectSchema } from '../../schemas/project'
import type { SubProjectSchema } from '../../schemas/subProject'
import { BaseStrictAccessor } from './BaseStrictAccessor'
import { OptionalProjectAccessor } from './OptionalProjectAccessor'

export class ProjectAccessor extends BaseStrictAccessor implements ProjectAccessorSchema {
  readonly optional: OptionalProjectAccessor

  constructor(public readonly root: ProjectSchema) {
    super({ type: 'project', id: root.id, name: root.name })
    this.optional = new OptionalProjectAccessor(root)
    this.subProject = this.subProject.bind(this)
  }

  subProject(id: string): SubProjectSchema {
    return this.requireResult(this.optional.subProject(id), 'sub-project')
  }
}
