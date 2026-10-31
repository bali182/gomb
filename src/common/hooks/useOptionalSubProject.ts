import { useEditorContext } from '../contexts/EditorContext'
import { Loadable } from '../loadable'
import type { ComputedSubProjectSchema, SubProjectSchema } from '../schemas/subProject'

type UseOptionalSubProjectResult = {
  subProject: SubProjectSchema | undefined
  computedSubProject: ComputedSubProjectSchema | undefined
}

export const useOptionalSubProject = (): UseOptionalSubProjectResult => {
  const { computedSubProject, subProject } = useEditorContext()
  return { computedSubProject: Loadable.get(computedSubProject), subProject }
}
