import type { ComputedSubProjectAccessorSchema, SubProjectAccessorSchema } from '../schemas/accessors'
import type { ComputedSubProjectSchema, SubProjectSchema } from '../schemas/subProject'
import { required } from '../utils/required'
import { useOptionalSubProject } from './useOptionalSubProject'

type UseSubProjectResult = {
  subProject: SubProjectSchema
  computedSubProject: ComputedSubProjectSchema
  accessor: SubProjectAccessorSchema
  computedAccessor: ComputedSubProjectAccessorSchema
}

export const useSubProject = (): UseSubProjectResult => {
  const { subProject, computedSubProject, accessor, computedAccessor } = useOptionalSubProject()
  return {
    subProject: required(subProject, 'useSubProject requires a valid subproject route'),
    computedSubProject: required(computedSubProject, 'useSubProject requires a valid subproject route'),
    accessor: required(accessor, 'useSubProject requires a subproject accessor'),
    computedAccessor: required(computedAccessor, 'useSubProject requires a computed subproject accessor'),
  }
}
