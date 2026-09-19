import { G, Path } from '@react-pdf/renderer'
import type { FC } from 'react'

import { useExportDrawAreaContext } from '../../contexts/ExportDrawAreaContext'
import { usePath } from '../../hooks/usePath'
import type { DrawAreaComponentStyleParams } from '../../schemas/drawArea'
import type { SvgExportTPocketSchema } from '../../schemas/svgExport'
import { isDefined } from '../../utils/isDefined'
import { PdfElementText } from './PdfElementText'
import { PdfMarkerPath } from './PdfMarkerPath'
import { PdfStitchLine } from './PdfStitchLine'

type PdfTPocketProps = {
  element: SvgExportTPocketSchema
}

export const PdfTPocket: FC<PdfTPocketProps> = ({ element }) => {
  const { componentStyles } = useExportDrawAreaContext()
  const pathData = usePath(element.pocket.path)
  const styleParams: DrawAreaComponentStyleParams = {
    component: element.ownerComponent,
    nestingLevel: 0,
  }

  return (
    <G>
      {isDefined(element.cutHelper) && <PdfMarkerPath path={element.cutHelper} />}
      <Path
        d={pathData}
        fill={componentStyles.getBackgroundColor(styleParams)}
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
