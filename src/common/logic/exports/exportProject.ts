import { DrawAreaContextValue } from '../../schemas/drawArea'
import type { ExportLayoutSchema, ExportParamsSchema } from '../../schemas/export'
import type { ProjectSchema } from '../../schemas/project'
import type { ExportSettingsSchema } from '../../schemas/settings'
import type { TranslationSchema } from '../../translations/translationSchema'
import { getComputedProject } from '../getComputedProject'
import { exportPdf } from './exportPdf'
import { exportPng } from './exportPng'
import { exportSvg } from './exportSvg'
import { getExportElements } from './getExportElements'
import { getExportLayout, getExportPageSize } from './getExportLayout'

export type ExportProjectParamsSchema = {
  project: ProjectSchema
  settings: ExportSettingsSchema
  context: DrawAreaContextValue
  translation: TranslationSchema
}

export const exportProject = async ({
  project,
  settings,
  context,
  translation,
}: ExportProjectParamsSchema): Promise<ExportLayoutSchema> => {
  const computedProject = getComputedProject(project)
  const elements = getExportElements(project, computedProject, settings)
  const layout = getExportLayout(elements, settings, context)

  if (layout.type === 'unsuccessful-export') {
    return layout
  }

  const pageSize = getExportPageSize(settings)
  const exportParams: ExportParamsSchema = { layout, pageSize, context, projectName: project.name, translation }
  switch (settings.format) {
    case 'pdf':
      await exportPdf(exportParams)
      break
    case 'svg':
      exportSvg(exportParams)
      break
    case 'png':
      await exportPng(exportParams)
      break
  }

  return layout
}
