import { useId, type FC } from 'react'
import { STROKE_THICKNESS } from '../../constants/drawing'
import { EXPORT_PREVIEW_PAGE_COLOR } from '../../constants/exportPreview'
import { useExportPreview } from '../../contexts/ExportPreviewContext'
import type { ExportPageSchema } from '../../schemas/export'
import { SvgExportElement } from './SvgExportElement'

type SvgExportPageProps = {
  page: ExportPageSchema
  showPageBorder?: boolean
}

export const SvgExportPage: FC<SvgExportPageProps> = ({ page: { boundingRect, elements }, showPageBorder = true }) => {
  const preview = useExportPreview()
  const shadowId = useId()
  // Extend the filter region by three standard deviations around the shifted shadow.
  const shadowMargin = preview.pageShadowBlur * 3
  const inset = preview.isPreview ? preview.strokeWidth / 2 : 0
  return (
    <g>
      {preview.isPreview && showPageBorder && (
        <defs>
          <filter
            id={shadowId}
            filterUnits="userSpaceOnUse"
            x={boundingRect.x.minus(shadowMargin).plus(Math.min(0, preview.pageShadowOffsetX)).toString()}
            y={boundingRect.y.minus(shadowMargin).plus(Math.min(0, preview.pageShadowOffsetY)).toString()}
            width={boundingRect.width.plus(shadowMargin * 2 + Math.abs(preview.pageShadowOffsetX)).toString()}
            height={boundingRect.height.plus(shadowMargin * 2 + Math.abs(preview.pageShadowOffsetY)).toString()}
          >
            <feDropShadow
              dx={preview.pageShadowOffsetX}
              dy={preview.pageShadowOffsetY}
              stdDeviation={preview.pageShadowBlur}
              floodColor={preview.pageShadowColor}
              floodOpacity={preview.pageShadowOpacity}
            />
          </filter>
        </defs>
      )}
      {showPageBorder && (
        <rect
          x={boundingRect.x.plus(inset).toString()}
          y={boundingRect.y.plus(inset).toString()}
          width={boundingRect.width.minus(inset * 2).toString()}
          height={boundingRect.height.minus(inset * 2).toString()}
          fill={preview.isPreview ? EXPORT_PREVIEW_PAGE_COLOR : 'none'}
          filter={preview.isPreview ? `url(#${shadowId})` : undefined}
          stroke={preview.pageStrokeColor}
          strokeWidth={preview.isPreview ? preview.strokeWidth : STROKE_THICKNESS}
        />
      )}
      {elements.map((element) => (
        <SvgExportElement key={`${element.element.subProject.id}:${element.element.id}`} element={element} />
      ))}
    </g>
  )
}
