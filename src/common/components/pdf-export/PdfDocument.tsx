import { Document, Page } from '@react-pdf/renderer'
import type { FC } from 'react'

import { ExportDrawAreaContext } from '../../contexts/ExportDrawAreaContext'
import type { DrawAreaContextValue } from '../../schemas/drawArea'
import type { ExportLayoutSchema } from '../../schemas/export'
import { PdfPageRoot } from './PdfPageRoot'

type PdfDocumentProps = {
  drawAreaContextValue: DrawAreaContextValue
  layout: ExportLayoutSchema
}

export const PdfDocument: FC<PdfDocumentProps> = ({ drawAreaContextValue, layout }) => {
  return (
    <ExportDrawAreaContext.Provider value={drawAreaContextValue}>
      <Document>
        {layout.pages.map((page, pageIndex) => (
          <Page
            key={pageIndex}
            size={[`${page.boundingRect.width.toString()}mm`, `${page.boundingRect.height.toString()}mm`]}
            style={{ padding: 0 }}
          >
            <PdfPageRoot page={page} />
          </Page>
        ))}
      </Document>
    </ExportDrawAreaContext.Provider>
  )
}
