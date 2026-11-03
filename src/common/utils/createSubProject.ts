import { createComponent } from '../operations/subProject/utils/createComponent'
import { createPocketOpening } from '../operations/subProject/utils/createPocketOpening'
import { StitchLineCommonConfigSchema } from '../schemas/stitching'
import type { SubProjectSchema } from '../schemas/subProject'
import { id } from './id'

export const createSubProject = (
  rootName: string,
  stitchingSettings: StitchLineCommonConfigSchema,
  defaultOpeningName: string,
): SubProjectSchema => {
  const root = createComponent({
    id: id(),
    name: rootName,
    type: 'root-panel',
    stitchingSettings,
  })
  const defaultPocketOpening = createPocketOpening({ type: 'straight', id: id(), name: defaultOpeningName })

  return {
    id: id(),
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
