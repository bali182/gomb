import type { FC } from 'react'

import { useExportDrawAreaContext } from '../../contexts/ExportDrawAreaContext'
import { usePath } from '../../hooks/usePath'
import type { DrawAreaComponentStyleParams } from '../../schemas/drawArea'
import type { SvgExportPanelSchema } from '../../schemas/svgExport'
import { isDefined } from '../../utils/isDefined'
import { ExportElementText } from './ExportElementText'
import { ExportMarkerPath } from './ExportMarkerPath'
import { ExportStitchLine } from './ExportStitchLine'

type ExportPanelProps = {
  element: SvgExportPanelSchema
}

export const ExportPanel: FC<ExportPanelProps> = ({ element }) => {
  const { componentStyles, exportIdentifiers } = useExportDrawAreaContext()
  const pathData = usePath(element.path)
  const styleParams: DrawAreaComponentStyleParams = {
    component: element.component,
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

      {element.childMarkerPaths.map((path, index) => (
        <ExportMarkerPath key={index} path={path} />
      ))}

      {element.stitchLines.map((stitchLine) => (
        <ExportStitchLine key={stitchLine.stitchLine.id} stitchLine={stitchLine} />
      ))}

      <ExportElementText element={element} />
    </g>
  )
}
