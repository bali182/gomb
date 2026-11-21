import type { FC } from 'react'
import { useExportPreview } from '../../contexts/ExportPreviewContext'
import { getExportElementBoundingRect } from '../../logic/exports/exportGeometryUtils'

import { useExportDrawAreaContext } from '../../contexts/ExportDrawAreaContext'
import { getExportElementText } from '../../logic/exports/getExportElementText'
import type { ExportElementSchema } from '../../schemas/export'

type ExportElementTextProps = {
  element: ExportElementSchema
}

export const ExportElementText: FC<ExportElementTextProps> = ({ element }) => {
  const preview = useExportPreview()
  const context = useExportDrawAreaContext()
  const { exportIdentifiers } = context
  const positionedLines = getExportElementText(element, context)

  if (positionedLines.length === 0) {
    return null
  }

  const boundingRect = getExportElementBoundingRect(element)
  return (
    <g data-text-for-component={exportIdentifiers.getElementId(element)}>
      {positionedLines.map((position) => {
        if (preview.isPreview) {
          let ratio: number
          switch (position.line.type) {
            case 'name':
              ratio = preview.nameWidthRatio
              break
            case 'parent-name':
              ratio = preview.parentNameWidthRatio
              break
            case 'dimensions':
              ratio = preview.sizeWidthRatio
              break
          }
          const halfWidth = boundingRect.width.times(ratio).dividedBy(2)
          return (
            <path
              key={position.line.type}
              d={`M ${position.x.minus(halfWidth)} ${position.y} H ${position.x.plus(halfWidth)}`}
              fill="none"
              stroke={position.line.color}
              strokeWidth={preview.strokeWidth}
            />
          )
        }
        return (
          <text
            alignmentBaseline="middle"
            dominantBaseline="middle"
            fill={position.line.color}
            fontFamily={position.line.fontFamily}
            fontSize={position.line.fontSize}
            key={position.line.type}
            textAnchor="middle"
            x={position.x.toString()}
            y={position.y.toString()}
          >
            {position.line.text}
          </text>
        )
      })}
    </g>
  )
}
