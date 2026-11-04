import { createComponent } from '../operations/subProject/utils/createComponent'
import { createPocketOpening } from '../operations/subProject/utils/createPocketOpening'
import type { IdGeneratorSchema } from '../schemas/idGenerator'
import { StitchLineCommonConfigSchema } from '../schemas/stitching'
import type { SubProjectSchema } from '../schemas/subProject'

export const createSubProject = (
  rootName: string,
  stitchingSettings: StitchLineCommonConfigSchema,
  defaultOpeningName: string,
  idGenerator: IdGeneratorSchema,
): SubProjectSchema => {
  const root = createComponent({
    id: idGenerator.get('component'),
    name: rootName,
    type: 'root-panel',
    stitchingSettings,
  })
  const defaultPocketOpening = createPocketOpening({
    type: 'straight',
    id: idGenerator.get('pocket-opening'),
    name: defaultOpeningName,
  })

  return {
    id: idGenerator.get('sub-project'),
    root: root.id,
    defaultPocketOpening: defaultPocketOpening.id,
    pocketOpenings: {
      [defaultPocketOpening.id]: defaultPocketOpening,
    },
    components: {
      [root.id]: root,
    },
    holes: [],
    stitchLines: [],
  }
}
