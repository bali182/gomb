import type { DrawAreaContextValue } from '../../schemas/drawArea'
import type { ExportLayoutSchema } from '../../schemas/export'
import type { ProjectSchema } from '../../schemas/project'
import type { ExportSettingsSchema } from '../../schemas/settings'
import { getComputedProject } from '../getComputedProject'
import { exportPdf } from './exportPdf'
import { exportSvg } from './exportSvg'
import { getExportElements } from './getExportElements'
import { getExportLayout, getExportPageSize } from './getExportLayout'

export const exportProject = async (
  project: ProjectSchema,
  settings: ExportSettingsSchema,
  context: DrawAreaContextValue,
): Promise<ExportLayoutSchema> => {
  const computedProject = getComputedProject(project)
  const elements = getExportElements(project, computedProject, settings)
  const layout = getExportLayout(elements, settings, context)

  if (layout.type === 'unsuccessful-export') {
    return layout
  }

  const pageSize = getExportPageSize(settings)
  switch (settings.format) {
    case 'pdf':
      await exportPdf(layout, pageSize, context, `${project.name}.pdf`)
      break
    case 'svg':
      exportSvg(layout, pageSize, context, `${project.name}.svg`)
      break
  }

  return layout
}
