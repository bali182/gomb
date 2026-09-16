import { Document, Page } from '@react-pdf/renderer'
import type { FC } from 'react'

import { ExportDrawAreaContext } from '../../contexts/ExportDrawAreaContext'
import type { DrawAreaContextValue } from '../../schemas/drawArea'
import type { SizeSchema } from '../../schemas/geometry'
import type { PdfExportSuccessfulLayoutSchema } from '../../schemas/pdfExport'
import { PdfPageRoot } from './PdfPageRoot'

type PdfDocumentProps = {
  drawAreaContextValue: DrawAreaContextValue
  layout: PdfExportSuccessfulLayoutSchema
  pageSize: SizeSchema
}

export const PdfDocument: FC<PdfDocumentProps> = ({ drawAreaContextValue, layout, pageSize }) => {
  return (
    <ExportDrawAreaContext.Provider value={drawAreaContextValue}>
      <Document>
        {layout.pages.map((page, pageIndex) => (
          <Page
            key={pageIndex}
            size={[`${pageSize.width.toString()}mm`, `${pageSize.height.toString()}mm`]}
            style={{ padding: 0 }}
          >
            <PdfPageRoot page={page} />
          </Page>
        ))}
      </Document>
    </ExportDrawAreaContext.Provider>
  )
}
