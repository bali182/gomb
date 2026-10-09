import type { DrawAreaContextValue } from '../../schemas/drawArea'
import type { ExportSuccessfulLayoutSchema } from '../../schemas/export'
import type { SizeSchema } from '../../schemas/geometry'
import { downloadFile } from '../../utils/downloadFile'
import { renderSvgToString } from './renderSvgToString'

export const exportSvg = (
  layout: ExportSuccessfulLayoutSchema,
  pageSize: SizeSchema,
  context: DrawAreaContextValue,
  filename: string,
): void => {
  const svg = renderSvgToString({ layout, pageSize, context })
  downloadFile({ contentType: 'image/svg+xml', content: svg, fileName: filename })
}
