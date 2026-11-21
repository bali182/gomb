import type { FC } from 'react'
import { useExportPreview } from '../../contexts/ExportPreviewContext'

import { useExportDrawAreaContext } from '../../contexts/ExportDrawAreaContext'
import { usePath } from '../../hooks/usePath'
import type { ExportStitchLineSchema } from '../../schemas/export'
import type { PathSchema } from '../../schemas/geometry'
import { ExportStitchHole } from './ExportStitchHole'

type ExportStitchLineProps = {
  stitchLine: ExportStitchLineSchema
}

type ExportStitchPathProps = {
  path: PathSchema
  stitchLine: ExportStitchLineSchema
}

export const ExportStitchLine: FC<ExportStitchLineProps> = ({ stitchLine }) => {
  const preview = useExportPreview()
  return (
    <g>
      {stitchLine.paths.map((path, index) => (
        <ExportStitchPath key={index} path={path} stitchLine={stitchLine} />
      ))}

      {!preview.isPreview &&
        stitchLine.holes.map((hole, index) => (
          <ExportStitchHole hole={hole} key={index} stitchLine={stitchLine.stitchLine} />
        ))}
    </g>
  )
}

const ExportStitchPath: FC<ExportStitchPathProps> = ({ path, stitchLine }) => {
  const preview = useExportPreview()
  const { stitchLineStyles, exportIdentifiers } = useExportDrawAreaContext()
  const pathData = usePath(path)

  return (
    <path
      data-stitch-line={exportIdentifiers.getStitchLineId(stitchLine.stitchLine)}
      d={pathData}
      fill="none"
      stroke={stitchLineStyles.getLineColor(stitchLine.stitchLine)}
      strokeWidth={preview.isPreview ? preview.strokeWidth : stitchLineStyles.getLineThickness(stitchLine.stitchLine)}
    />
  )
}
