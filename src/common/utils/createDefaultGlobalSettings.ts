import { VERSION } from '../../version'
import { defaultPdfExportParams, defaultSvgExportParams } from '../defaultStates'
import type { GlobalSettingsSchema, LanguageSchema } from '../schemas/settings'
import type { ThemeSchema } from '../schemas/theme'

export type DefaultNativeSettingsSchema = {
  theme: ThemeSchema
  language: LanguageSchema
}

export const createDefaultGlobalSettings = ({ language, theme }: DefaultNativeSettingsSchema): GlobalSettingsSchema => {
  return {
    version: VERSION,
    app: {
      splitterSizes: ['auto', '350px'],
      theme,
      language,
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
      stitchCountVisible: false,
      stitchHolesVisible: true,
      stitchLinesVisible: true,
      stitchesVisible: true,
    },
  }
}
