import { VERSION } from '../../version'
import { defaultColorSettings, defaultStitchingSettings } from '../defaultStates'
import type { ProjectSchema } from '../schemas/project'
import { id } from './id'

export const createProject = (name: string): ProjectSchema => {
  return {
    id: id(),
    name,
    version: VERSION,
    subProjects: [],
    colorSettings: { ...defaultColorSettings },
    stitchingSettings: { ...defaultStitchingSettings },
  }
}
