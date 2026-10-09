import type { FC, ReactNode } from 'react'

import type { ExportElementSchema, ExportPageElementSchema } from '../../schemas/export'
import { ExportFrontPocket } from './ExportFrontPocket'
import { ExportPanel } from './ExportPanel'
import { ExportTPocket } from './ExportTPocket'

type SvgExportElementProps = {
  element: ExportPageElementSchema
}

export const SvgExportElement: FC<SvgExportElementProps> = ({ element: { element, placement } }) => {
  const { boundingRect } = placement
  const centerX = boundingRect.x.plus(boundingRect.width.dividedBy(2))
  const centerY = boundingRect.y.plus(boundingRect.height.dividedBy(2))

  return (
    <g
      transform={
        placement.rotation !== 0
          ? `rotate(${placement.rotation} ${centerX.toString()} ${centerY.toString()})`
          : undefined
      }
    >
      {renderSvgExportElement(element)}
    </g>
  )
}

const renderSvgExportElement = (element: ExportElementSchema): ReactNode => {
  switch (element.type) {
    case 'export-panel':
      return <ExportPanel element={element} />
    case 'export-front-pocket':
      return <ExportFrontPocket element={element} />
    case 'export-t-pocket':
      return <ExportTPocket element={element} />
  }
}
