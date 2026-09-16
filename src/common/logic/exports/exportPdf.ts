import { Font, pdf } from '@react-pdf/renderer'

import type { DrawAreaContextValue } from '../../schemas/drawArea'
import type { PdfExportLayoutSchema, PdfExportSettingsSchema } from '../../schemas/pdfExport'
import type { ProjectSchema } from '../../schemas/project'
import { has } from '../../utils/has'
import { getComputedProject } from '../getComputedProject'
import { getComputedPdfExport } from './getComputedPdfExport'
import { getPdfExportPageSize } from './getPdfExportLayout'
import { renderPdfDocument } from './renderPdfDocument'

export const exportPdf = async (
  project: ProjectSchema,
  settings: PdfExportSettingsSchema,
  drawAreaContextValue: DrawAreaContextValue,
): Promise<PdfExportLayoutSchema> => {
  const computedProject = getComputedProject(project)
  const layout = getComputedPdfExport(project, computedProject, settings, drawAreaContextValue)

  if (layout.type === 'unsuccessful-pdf-export') {
    return layout
  }

  const pageSize = getPdfExportPageSize(settings)
  const openSans = await import('open-sans-fonts/open-sans/Regular/OpenSans-Regular.ttf?inline')

  const registeredFonts = Font.getRegisteredFonts()

  if (!has(registeredFonts, 'Open Sans')) {
    Font.register({
      family: 'Open Sans',
      src: openSans.default,
    })
  }

  const blob = await pdf(renderPdfDocument(layout, pageSize, drawAreaContextValue)).toBlob()

  downloadPdf(blob, `${project.name}.pdf`)

  return layout
}

const downloadPdf = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')

  anchor.href = url
  anchor.download = filename
  anchor.click()

  URL.revokeObjectURL(url)
}
