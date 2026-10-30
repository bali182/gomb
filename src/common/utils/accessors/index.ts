import type {
  ComputedProjectAccessorSchema,
  ComputedSubProjectAccessorSchema,
  ProjectAccessorSchema,
  SubProjectAccessorSchema,
} from '../../schemas/accessors'
import type { ComputedProjectSchema, ProjectSchema } from '../../schemas/project'
import type { ComputedSubProjectSchema, SubProjectSchema } from '../../schemas/subProject'
import { isDefined } from '../isDefined'
import { ComputedProjectAccessor } from './ComputedProjectAccessor'
import { ComputedSubProjectAccessor } from './ComputedSubProjectAccessor'
import { ProjectAccessor } from './ProjectAccessor'
import { SubProjectAccessor } from './SubProjectAccessor'

let lastProjectAccessor: ProjectAccessor | undefined

const project = (root: ProjectSchema): ProjectAccessorSchema => {
  if (!isDefined(lastProjectAccessor) || lastProjectAccessor.root !== root) {
    lastProjectAccessor = new ProjectAccessor(root)
  }
  return lastProjectAccessor
}

let lastSubProjectAccessor: SubProjectAccessor | undefined

const subProject = (root: SubProjectSchema): SubProjectAccessorSchema => {
  if (!isDefined(lastSubProjectAccessor) || lastSubProjectAccessor.root !== root) {
    lastSubProjectAccessor = new SubProjectAccessor(root)
  }
  return lastSubProjectAccessor
}

let lastComputedProjectAccessor: ComputedProjectAccessor | undefined

const computedProject = (root: ComputedProjectSchema): ComputedProjectAccessorSchema => {
  if (!isDefined(lastComputedProjectAccessor) || lastComputedProjectAccessor.root !== root) {
    lastComputedProjectAccessor = new ComputedProjectAccessor(root)
  }
  return lastComputedProjectAccessor
}

let lastComputedSubProjectAccessor: ComputedSubProjectAccessor | undefined

const computedSubProject = (root: ComputedSubProjectSchema): ComputedSubProjectAccessorSchema => {
  if (!isDefined(lastComputedSubProjectAccessor) || lastComputedSubProjectAccessor.root !== root) {
    lastComputedSubProjectAccessor = new ComputedSubProjectAccessor(root)
  }
  return lastComputedSubProjectAccessor
}

export const accessors = { project, subProject, computedProject, computedSubProject }
