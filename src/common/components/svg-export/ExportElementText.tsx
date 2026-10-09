import type { FC } from 'react'

import { useExportDrawAreaContext } from '../../contexts/ExportDrawAreaContext'
import { getExportElementText } from '../../logic/exports/getExportElementText'
import type { ExportElementSchema } from '../../schemas/export'

type ExportElementTextProps = {
  element: ExportElementSchema
}

export const ExportElementText: FC<ExportElementTextProps> = ({ element }) => {
  const context = useExportDrawAreaContext()
  const { exportIdentifiers } = context
  const positionedLines = getExportElementText(element, context)

  if (positionedLines.length === 0) {
    return null
  }

  return (
    <g data-text-for-component={exportIdentifiers.getElementId(element)}>
      {positionedLines.map((position) => (
        <text
          alignmentBaseline="middle"
          dominantBaseline="middle"
          fill={position.line.color}
          fontFamily={position.line.fontFamily}
          fontSize={position.line.fontSize}
          key={position.line.text}
          textAnchor="middle"
          x={position.x.toString()}
          y={position.y.toString()}
        >
          {position.line.text}
        </text>
      ))}
    </g>
  )
}
