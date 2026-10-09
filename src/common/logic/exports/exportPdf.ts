import { Font, pdf } from '@react-pdf/renderer'

import { PDF_EXTENSION } from '../../constants/fileExtensions'
import type { ExportParamsSchema } from '../../schemas/export'
import { has } from '../../utils/has'
import { renderPdfDocument } from './renderPdfDocument'

export const exportPdf = async ({ layout, pageSize, context, projectName }: ExportParamsSchema): Promise<void> => {
  const openSans = await import('open-sans-fonts/open-sans/Regular/OpenSans-Regular.ttf?inline')

  const registeredFonts = Font.getRegisteredFonts()

  if (!has(registeredFonts, 'Open Sans')) {
    Font.register({
      family: 'Open Sans',
      src: openSans.default,
    })
  }

  const blob = await pdf(renderPdfDocument(layout, pageSize, context)).toBlob()

  downloadPdf(blob, `${projectName}.${PDF_EXTENSION}`)
}

const downloadPdf = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')

  anchor.href = url
  anchor.download = filename
  anchor.click()

  URL.revokeObjectURL(url)
}
