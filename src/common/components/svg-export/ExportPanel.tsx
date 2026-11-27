import type { FC } from 'react'
import { useExportPreview } from '../../contexts/ExportPreviewContext'

import { useExportDrawAreaContext } from '../../contexts/ExportDrawAreaContext'
import { usePath } from '../../hooks/usePath'
import type { DrawAreaComponentBackgroundStyleParams, DrawAreaComponentStyleParams } from '../../schemas/drawArea'
import type { ExportPanelSchema } from '../../schemas/export'
import { isDefined } from '../../utils/isDefined'
import { ExportElementText } from './ExportElementText'
import { ExportMarkerPath } from './ExportMarkerPath'
import { ExportStitchLine } from './ExportStitchLine'

type ExportPanelProps = {
  element: ExportPanelSchema
  isOversized: boolean
}

export const ExportPanel: FC<ExportPanelProps> = ({ element, isOversized }) => {
  const preview = useExportPreview()
  const { componentStyles, exportIdentifiers } = useExportDrawAreaContext()
  const pathData = usePath(element.path)
  const backgroundStyleParams: DrawAreaComponentBackgroundStyleParams = {
    component: element.component,
    nestingLevel: 0,
  }
  const styleParams: DrawAreaComponentStyleParams = { component: element.component }

  const strokeColor =
    preview.isPreview && isOversized ? preview.errorStrokeColor : componentStyles.getBorderColor(styleParams)

  return (
    <g data-element-id={exportIdentifiers.getElementId(element)}>
      {isDefined(element.cutHelper) && <ExportMarkerPath path={element.cutHelper} />}
      <path
        d={pathData}
        fill={preview.isPreview ? 'none' : componentStyles.getBackgroundColor(backgroundStyleParams)}
        stroke={strokeColor}
        strokeWidth={preview.isPreview ? preview.strokeWidth : componentStyles.getBorderThickness(styleParams)}
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
