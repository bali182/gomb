import { Svg } from '@react-pdf/renderer'
import type { FC, ReactNode } from 'react'

import type { PdfExportElement, PdfExportPageSchema } from '../../schemas/pdfExport'
import type { SvgExportElementSchema } from '../../schemas/svgExport'
import { PdfFrontPocket } from './PdfFrontPocket'
import { PdfPanel } from './PdfPanel'
import { PdfTPocket } from './PdfTPocket'

type PdfPageRootProps = {
  page: PdfExportPageSchema
}

export const PdfPageRoot: FC<PdfPageRootProps> = ({ page }) => {
  return (
    <>
      {page.elements.map((pageElement) => (
        <PdfElement key={`${pageElement.element.subProject.id}:${pageElement.element.id}`} element={pageElement} />
      ))}
    </>
  )
}

type PdfElementProps = {
  element: PdfExportElement
}

const PdfElement: FC<PdfElementProps> = ({ element: { element, placement } }) => {
  const { boundingRect } = placement

  return (
    <Svg
      fixed
      height={`${boundingRect.height.toString()}mm`}
      style={{
        height: `${boundingRect.height.toString()}mm`,
        left: `${placement.x.toString()}mm`,
        position: 'absolute',
        top: `${placement.y.toString()}mm`,
        transform: placement.rotation === 90 ? [{ operation: 'rotate', value: [90, 0, 0] }] : undefined,
        width: `${boundingRect.width.toString()}mm`,
      }}
      viewBox={`${boundingRect.x.toString()} ${boundingRect.y.toString()} ${boundingRect.width.toString()} ${boundingRect.height.toString()}`}
      width={`${boundingRect.width.toString()}mm`}
    >
      {renderPdfElement(element)}
    </Svg>
  )
}

const renderPdfElement = (element: SvgExportElementSchema): ReactNode => {
  switch (element.type) {
    case 'svg-export-panel':
      return <PdfPanel element={element} />
    case 'svg-export-front-pocket':
      return <PdfFrontPocket element={element} />
    case 'svg-export-t-pocket':
      return <PdfTPocket element={element} />
  }
}
