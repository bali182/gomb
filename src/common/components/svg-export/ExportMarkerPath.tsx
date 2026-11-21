import type { FC } from 'react'
import { useExportPreview } from '../../contexts/ExportPreviewContext'

import { useExportDrawAreaContext } from '../../contexts/ExportDrawAreaContext'
import { usePath } from '../../hooks/usePath'
import type { PathSchema } from '../../schemas/geometry'

type ExportMarkerPathProps = {
  path: PathSchema
}

export const ExportMarkerPath: FC<ExportMarkerPathProps> = ({ path }) => {
  const preview = useExportPreview()
  const { markerStyles } = useExportDrawAreaContext()
  const pathData = usePath(path)

  return (
    <path
      d={pathData}
      fill="none"
      stroke={markerStyles.getColor()}
      strokeWidth={preview.isPreview ? preview.strokeWidth : markerStyles.getThickness()}
    />
  )
}
