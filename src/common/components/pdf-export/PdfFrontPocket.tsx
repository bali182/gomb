import { G, Path } from '@react-pdf/renderer'
import type { FC } from 'react'

import { useExportDrawAreaContext } from '../../contexts/ExportDrawAreaContext'
import { usePath } from '../../hooks/usePath'
import type { DrawAreaComponentBackgroundStyleParams, DrawAreaComponentStyleParams } from '../../schemas/drawArea'
import type { ExportFrontPocketSchema } from '../../schemas/export'
import { isDefined } from '../../utils/isDefined'
import { PdfElementText } from './PdfElementText'
import { PdfMarkerPath } from './PdfMarkerPath'
import { PdfStitchLine } from './PdfStitchLine'

type PdfFrontPocketProps = {
  element: ExportFrontPocketSchema
}

export const PdfFrontPocket: FC<PdfFrontPocketProps> = ({ element }) => {
  const { componentStyles } = useExportDrawAreaContext()
  const pathData = usePath(element.pocket.path)
  const backgroundStyleParams: DrawAreaComponentBackgroundStyleParams = {
    component: element.component,
    nestingLevel: 0,
  }
  const styleParams: DrawAreaComponentStyleParams = { component: element.component }

  return (
    <G>
      {isDefined(element.cutHelper) && <PdfMarkerPath path={element.cutHelper} />}
      <Path
        d={pathData}
        fill={componentStyles.getBackgroundColor(backgroundStyleParams)}
        stroke={componentStyles.getBorderColor(styleParams)}
        strokeWidth={componentStyles.getBorderThickness(styleParams)}
      />
      {element.stitchLines.map((stitchLine) => (
        <PdfStitchLine key={stitchLine.stitchLine.id} stitchLine={stitchLine} />
      ))}
      <PdfElementText element={element} />
    </G>
  )
}
