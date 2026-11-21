import { PdfDocument } from '../../components/pdf-export/PdfDocument'
import type { DrawAreaContextValue } from '../../schemas/drawArea'
import type { ExportLayoutSchema } from '../../schemas/export'
import type { SizeSchema } from '../../schemas/geometry'

export const renderPdfDocument = (
  layout: ExportLayoutSchema,
  pageSize: SizeSchema,
  drawAreaContextValue: DrawAreaContextValue,
) => {
  return <PdfDocument drawAreaContextValue={drawAreaContextValue} layout={layout} pageSize={pageSize} />
}
