import { VERSION } from '../../version'
import { defaultExportParams } from '../defaultStates'
import type { AppSettingsSchema, GlobalSettingsSchema } from '../schemas/settings'

export const createDefaultGlobalSettings = ({ language, theme }: AppSettingsSchema): GlobalSettingsSchema => {
  return {
    version: VERSION,
    app: {
      theme,
      language,
    },
    ui: {
      splitterSizes: ['auto', '350px'],
      treeSections: {
        components: { open: true, size: 1 },
        openings: { open: false, size: 1 },
        constraints: { open: false, size: 1 },
      },
    },
    edit: {
      addBaseColor: false,
      step: 1,
    },
    export: defaultExportParams,
    recentProjects: {},
    view: {
      scale: 1,
      componentDimensionsVisible: false,
      pocketItemsVisible: true,
      stitchCountVisible: false,
      stitchHolesVisible: true,
      stitchHoleFootprintVisible: false,
      stitchLinesVisible: true,
      stitchesVisible: true,
    },
  }
}
