import { createComponent } from '../operations/subProject/utils/createComponent'
import { StitchLineCommonConfigSchema } from '../schemas/stitching'
import type { SubProjectSchema } from '../schemas/subProject'
import { id } from './id'

export const createSubProject = (
  rootName: string,
  stitchingSettings: StitchLineCommonConfigSchema,
): SubProjectSchema => {
  const root = createComponent({
    id: id(),
    name: rootName,
    type: 'root-panel',
    stitchingSettings,
  })

  return {
    id: id(),
    root: root.id,
    components: {
      [root.id]: root,
    },
    holes: [],
    stitchLines: [],
    locks: { components: {} },
  }
}
