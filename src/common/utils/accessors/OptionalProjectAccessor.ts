import type { OptionalAccessorSchema, StrictProjectAccessorSchema } from '../../schemas/accessors'
import type { ProjectSchema } from '../../schemas/project'
import type { SubProjectSchema } from '../../schemas/subProject'

export class OptionalProjectAccessor implements OptionalAccessorSchema<StrictProjectAccessorSchema> {
  private readonly subProjects = new Map<string, SubProjectSchema>()

  constructor(root: ProjectSchema) {
    for (const subProject of root.subProjects) {
      if (!this.subProjects.has(subProject.id)) {
        this.subProjects.set(subProject.id, subProject)
      }
    }
    this.subProject = this.subProject.bind(this)
  }

  subProject(id: string): SubProjectSchema | undefined {
    return this.subProjects.get(id)
  }
}
