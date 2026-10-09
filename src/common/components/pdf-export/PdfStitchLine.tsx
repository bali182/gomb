import { G, Path } from '@react-pdf/renderer'
import type { FC } from 'react'

import { useExportDrawAreaContext } from '../../contexts/ExportDrawAreaContext'
import { usePath } from '../../hooks/usePath'
import type { ExportStitchLineSchema } from '../../schemas/export'
import type { PathSchema } from '../../schemas/geometry'
import { PdfStitchHole } from './PdfStitchHole'

type PdfStitchLineProps = {
  stitchLine: ExportStitchLineSchema
}

type PdfStitchPathProps = {
  path: PathSchema
  stitchLine: ExportStitchLineSchema
}

export const PdfStitchLine: FC<PdfStitchLineProps> = ({ stitchLine }) => {
  return (
    <G>
      {stitchLine.paths.map((path, index) => (
        <PdfStitchPath key={index} path={path} stitchLine={stitchLine} />
      ))}
      {stitchLine.holes.map((hole, index) => (
        <PdfStitchHole hole={hole} key={index} stitchLine={stitchLine.stitchLine} />
      ))}
    </G>
  )
}

const PdfStitchPath: FC<PdfStitchPathProps> = ({ path, stitchLine }) => {
  const { stitchLineStyles } = useExportDrawAreaContext()
  const pathData = usePath(path)

  return (
    <Path
      d={pathData}
      fill="none"
      stroke={stitchLineStyles.getLineColor(stitchLine.stitchLine)}
      strokeWidth={stitchLineStyles.getLineThickness(stitchLine.stitchLine)}
    />
  )
}
