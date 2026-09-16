import type { DrawAreaContextValue } from '../../schemas/drawArea'
import type { PdfExportLayoutSchema, PdfExportSettingsSchema } from '../../schemas/pdfExport'
import type { ComputedProjectSchema, ProjectSchema } from '../../schemas/project'
import { getComputedSvgExport } from './getComputedSvgExport'
import { getPdfExportLayout } from './getPdfExportLayout'

export const getComputedPdfExport = (
  project: ProjectSchema,
  computedProject: ComputedProjectSchema,
  settings: PdfExportSettingsSchema,
  drawAreaContextValue: DrawAreaContextValue,
): PdfExportLayoutSchema => {
  const svgExport = getComputedSvgExport(project, computedProject, settings)
  return getPdfExportLayout(svgExport.elements, settings, drawAreaContextValue)
}
