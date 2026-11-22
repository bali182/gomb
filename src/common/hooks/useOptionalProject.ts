import { useEditorContext } from '../contexts/EditorContext'
import type { ProjectAccessorSchema } from '../schemas/accessors'
import type { ProjectSchema } from '../schemas/project'

type UseOptionalProjectResult = {
  project: ProjectSchema | undefined
  accessor: ProjectAccessorSchema | undefined
}

export const useOptionalProject = (): UseOptionalProjectResult => {
  const { project, projectAccessor: accessor } = useEditorContext()
  return { project, accessor }
}
