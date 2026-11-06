import { VERSION } from '../../version'
import { defaultColorSettings, defaultStitchingSettings } from '../defaultStates'
import type { ProjectSchema } from '../schemas/project'
import { IdGenerator } from './random/IdGenerator'

export const createProject = (name: string): ProjectSchema => {
  return {
    id: new IdGenerator().get('project'),
    name,
    version: VERSION,
    subProjects: [],
    colorSettings: { ...defaultColorSettings },
    stitchingSettings: { ...defaultStitchingSettings },
  }
}
