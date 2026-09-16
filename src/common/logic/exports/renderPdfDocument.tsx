import { PdfDocument } from '../../components/pdf-export/PdfDocument'
import type { DrawAreaContextValue } from '../../schemas/drawArea'
import type { SizeSchema } from '../../schemas/geometry'
import type { PdfExportSuccessfulLayoutSchema } from '../../schemas/pdfExport'

export const renderPdfDocument = (
  layout: PdfExportSuccessfulLayoutSchema,
  pageSize: SizeSchema,
  drawAreaContextValue: DrawAreaContextValue,
) => {
  return <PdfDocument drawAreaContextValue={drawAreaContextValue} layout={layout} pageSize={pageSize} />
}
