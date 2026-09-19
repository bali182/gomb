import type { FC } from 'react'

import { useExportDrawAreaContext } from '../../contexts/ExportDrawAreaContext'
import { usePath } from '../../hooks/usePath'
import type { DrawAreaComponentStyleParams } from '../../schemas/drawArea'
import type { SvgExportTPocketSchema } from '../../schemas/svgExport'
import { isDefined } from '../../utils/isDefined'
import { ExportElementText } from './ExportElementText'
import { ExportMarkerPath } from './ExportMarkerPath'
import { ExportStitchLine } from './ExportStitchLine'

type ExportTPocketProps = {
  element: SvgExportTPocketSchema
}

export const ExportTPocket: FC<ExportTPocketProps> = ({ element }) => {
  const { componentStyles, exportIdentifiers } = useExportDrawAreaContext()
  const pathData = usePath(element.pocket.path)
  const styleParams: DrawAreaComponentStyleParams = {
    component: element.ownerComponent,
    nestingLevel: 0,
  }

  return (
    <g data-element-id={exportIdentifiers.getElementId(element)}>
      {isDefined(element.cutHelper) && <ExportMarkerPath path={element.cutHelper} />}
      <path
        d={pathData}
        fill={componentStyles.getBackgroundColor(styleParams)}
        stroke={componentStyles.getBorderColor(styleParams)}
        strokeWidth={componentStyles.getBorderThickness(styleParams)}
      />

      {element.stitchLines.map((stitchLine) => (
        <ExportStitchLine key={stitchLine.stitchLine.id} stitchLine={stitchLine} />
      ))}

      <ExportElementText element={element} />
    </g>
  )
}
