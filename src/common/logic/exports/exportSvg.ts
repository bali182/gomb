import { SVG_EXTENSION } from '../../constants/fileExtensions'
import type { ExportParamsSchema } from '../../schemas/export'
import { downloadFile } from '../../utils/downloadFile'
import { renderSvgToString } from './renderSvgToString'

export const exportSvg = ({ layout, pageSize, context, projectName }: ExportParamsSchema): void => {
  const svg = renderSvgToString({ layout, pageSize, context })
  downloadFile({ contentType: 'image/svg+xml', content: svg, fileName: `${projectName}.${SVG_EXTENSION}` })
}
