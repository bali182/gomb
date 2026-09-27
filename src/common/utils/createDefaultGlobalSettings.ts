import { VERSION } from '../../version'
import { defaultPdfExportParams, defaultSvgExportParams } from '../defaultStates'
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
    },
    edit: {
      addBaseColor: false,
      step: 1,
    },
    pdfExport: defaultPdfExportParams,
    recentProjects: {},
    svgExport: defaultSvgExportParams,
    view: {
      scale: 1,
      componentDimensionsVisible: false,
      stitchCountVisible: false,
      stitchHolesVisible: true,
      stitchLinesVisible: true,
      stitchesVisible: true,
    },
  }
}
