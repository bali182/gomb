import { G, Text } from '@react-pdf/renderer'
import type { FC } from 'react'

import { useExportDrawAreaContext } from '../../contexts/ExportDrawAreaContext'
import { getExportElementText } from '../../logic/exports/getExportElementText'
import type { ExportElementSchema } from '../../schemas/export'

type PdfElementTextProps = {
  element: ExportElementSchema
}

export const PdfElementText: FC<PdfElementTextProps> = ({ element }) => {
  const context = useExportDrawAreaContext()
  const positionedLines = getExportElementText(element, context)

  if (positionedLines.length === 0) {
    return null
  }

  return (
    <G>
      {positionedLines.map((position) => (
        <Text
          dominantBaseline="middle"
          fill={position.line.color}
          key={position.line.text}
          style={{ fontFamily: 'Open Sans' }}
          textAnchor="middle"
          x={position.x.toString()}
          y={position.y.toString()}
          {...{ fontSize: position.line.fontSize }}
        >
          {position.line.text}
        </Text>
      ))}
    </G>
  )
}
