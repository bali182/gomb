import type { ProjectAccessorSchema } from '../schemas/accessors'
import type { ProjectSchema } from '../schemas/project'
import { required } from '../utils/required'
import { useOptionalProject } from './useOptionalProject'

type UseProjectResult = {
  project: ProjectSchema
  accessor: ProjectAccessorSchema
}

export const useProject = (): UseProjectResult => {
  const { project, accessor } = useOptionalProject()
  return {
    project: required(project, 'useProject requires a valid project route'),
    accessor: required(accessor, 'useProject requires a project accessor'),
  }
}
