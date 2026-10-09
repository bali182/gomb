import { Font, pdf } from '@react-pdf/renderer'

import type { DrawAreaContextValue } from '../../schemas/drawArea'
import type { ExportSuccessfulLayoutSchema } from '../../schemas/export'
import type { SizeSchema } from '../../schemas/geometry'
import { has } from '../../utils/has'
import { renderPdfDocument } from './renderPdfDocument'

export const exportPdf = async (
  layout: ExportSuccessfulLayoutSchema,
  pageSize: SizeSchema,
  drawAreaContextValue: DrawAreaContextValue,
  filename: string,
): Promise<void> => {
  const openSans = await import('open-sans-fonts/open-sans/Regular/OpenSans-Regular.ttf?inline')

  const registeredFonts = Font.getRegisteredFonts()

  if (!has(registeredFonts, 'Open Sans')) {
    Font.register({
      family: 'Open Sans',
      src: openSans.default,
    })
  }

  const blob = await pdf(renderPdfDocument(layout, pageSize, drawAreaContextValue)).toBlob()

  downloadPdf(blob, filename)
}

const downloadPdf = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')

  anchor.href = url
  anchor.download = filename
  anchor.click()

  URL.revokeObjectURL(url)
}
