import { renderToString } from 'react-dom/server'

import { SvgExportPage } from '../../components/svg-export/SvgExportPage'
import { ExportDrawAreaContext } from '../../contexts/ExportDrawAreaContext'
import type { DrawAreaContextValue } from '../../schemas/drawArea'
import type { ExportPageSchema } from '../../schemas/export'
import type { SizeSchema } from '../../schemas/geometry'
import { getViewBox } from '../../utils/getViewBox'

type RenderSvgPageToStringParams = {
  page: ExportPageSchema
  pageSize: SizeSchema
  context: DrawAreaContextValue
}

export const renderSvgPageToString = ({ page, pageSize, context }: RenderSvgPageToStringParams): string =>
  renderToString(
    <ExportDrawAreaContext.Provider value={context}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={`${pageSize.width.toString()}mm`}
        height={`${pageSize.height.toString()}mm`}
        viewBox={getViewBox(page.boundingRect, 0)}
      >
        <SvgExportPage page={page} showPageBorder={false} />
      </svg>
    </ExportDrawAreaContext.Provider>,
  )
