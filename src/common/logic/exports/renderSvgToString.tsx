import { renderToString } from 'react-dom/server'

import { SvgExportRoot } from '../../components/svg-export/SvgExportRoot'
import type { DrawAreaContextValue } from '../../schemas/drawArea'
import type { ExportSuccessfulLayoutSchema } from '../../schemas/export'
import type { SizeSchema } from '../../schemas/geometry'

type RenderSvgToStringParams = {
  layout: ExportSuccessfulLayoutSchema
  pageSize: SizeSchema
  context: DrawAreaContextValue
}

export const renderSvgToString = ({ layout, pageSize, context }: RenderSvgToStringParams): string => {
  return renderToString(<SvgExportRoot context={context} layout={layout} pageSize={pageSize} />)
}
