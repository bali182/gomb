import type { FC } from 'react'

import { STROKE_COLOR, STROKE_THICKNESS } from '../../constants/drawing'
import type { ExportPageSchema } from '../../schemas/export'
import { SvgExportElement } from './SvgExportElement'

type SvgExportPageProps = {
  page: ExportPageSchema
  showPageBorder?: boolean
}

export const SvgExportPage: FC<SvgExportPageProps> = ({ page: { boundingRect, elements }, showPageBorder = true }) => (
  <g>
    {showPageBorder && (
      <rect
        x={boundingRect.x.toString()}
        y={boundingRect.y.toString()}
        width={boundingRect.width.toString()}
        height={boundingRect.height.toString()}
        fill="none"
        stroke={STROKE_COLOR}
        strokeWidth={STROKE_THICKNESS}
      />
    )}
    {elements.map((element) => (
      <SvgExportElement key={`${element.element.subProject.id}:${element.element.id}`} element={element} />
    ))}
  </g>
)
