import { useEditorContext } from '../contexts/EditorContext'
import { Loadable } from '../loadable'
import type { ComputedSubProjectAccessorSchema, SubProjectAccessorSchema } from '../schemas/accessors'
import type { ComputedSubProjectSchema, SubProjectSchema } from '../schemas/subProject'

type UseOptionalSubProjectResult = {
  subProject: SubProjectSchema | undefined
  computedSubProject: ComputedSubProjectSchema | undefined
  accessor: SubProjectAccessorSchema | undefined
  computedAccessor: ComputedSubProjectAccessorSchema | undefined
}

export const useOptionalSubProject = (): UseOptionalSubProjectResult => {
  const {
    computedSubProject,
    subProject,
    subProjectAccessor: accessor,
    computedSubProjectAccessor: computedAccessor,
  } = useEditorContext()

  return {
    computedSubProject: Loadable.get(computedSubProject),
    subProject,
    accessor,
    computedAccessor,
  }
}
