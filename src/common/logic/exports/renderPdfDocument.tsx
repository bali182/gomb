import { PdfDocument } from '../../components/pdf-export/PdfDocument'
import type { DrawAreaContextValue } from '../../schemas/drawArea'
import type { ExportSuccessfulLayoutSchema } from '../../schemas/export'
import type { SizeSchema } from '../../schemas/geometry'

export const renderPdfDocument = (
  layout: ExportSuccessfulLayoutSchema,
  pageSize: SizeSchema,
  drawAreaContextValue: DrawAreaContextValue,
) => {
  return <PdfDocument drawAreaContextValue={drawAreaContextValue} layout={layout} pageSize={pageSize} />
}
