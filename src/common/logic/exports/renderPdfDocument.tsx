import { PdfDocument } from '../../components/pdf-export/PdfDocument'
import type { DrawAreaContextValue } from '../../schemas/drawArea'
import type { ExportLayoutSchema } from '../../schemas/export'

export const renderPdfDocument = (layout: ExportLayoutSchema, drawAreaContextValue: DrawAreaContextValue) => {
  return <PdfDocument drawAreaContextValue={drawAreaContextValue} layout={layout} />
}
