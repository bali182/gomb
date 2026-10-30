import type { OptionalAccessorSchema, StrictComputedProjectAccessorSchema } from '../../schemas/accessors'
import type { ComputedProjectSchema } from '../../schemas/project'
import type { ComputedSubProjectSchema } from '../../schemas/subProject'

export class OptionalComputedProjectAccessor implements OptionalAccessorSchema<StrictComputedProjectAccessorSchema> {
  private readonly subProjects = new Map<string, ComputedSubProjectSchema>()

  constructor(root: ComputedProjectSchema) {
    for (const subProject of root.subProjects) {
      if (!this.subProjects.has(subProject.id)) {
        this.subProjects.set(subProject.id, subProject)
      }
    }
    this.subProject = this.subProject.bind(this)
  }

  subProject(id: string): ComputedSubProjectSchema | undefined {
    return this.subProjects.get(id)
  }
}
