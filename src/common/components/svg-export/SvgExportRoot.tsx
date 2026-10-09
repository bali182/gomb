import BigNumber from 'bignumber.js'
import type { FC } from 'react'

import { STROKE_THICKNESS } from '../../constants/drawing'
import { ZERO } from '../../constants/layout'
import { ExportDrawAreaContext } from '../../contexts/ExportDrawAreaContext'
import type { DrawAreaContextValue } from '../../schemas/drawArea'
import type { ExportSuccessfulLayoutSchema } from '../../schemas/export'
import type { RectSchema, SizeSchema } from '../../schemas/geometry'
import { getViewBox } from '../../utils/getViewBox'
import { SvgExportPage } from './SvgExportPage'

type SvgExportRootProps = {
  context: DrawAreaContextValue
  layout: ExportSuccessfulLayoutSchema
  pageSize: SizeSchema
}

export const SvgExportRoot: FC<SvgExportRootProps> = ({ context, layout, pageSize }) => {
  const boundingRect: RectSchema = {
    x: ZERO,
    y: ZERO,
    width: pageSize.width,
    height: layout.pages.reduce(
      (height, page) => BigNumber.maximum(height, page.boundingRect.y.plus(page.boundingRect.height)),
      ZERO,
    ),
  }
  const width = boundingRect.width.plus(STROKE_THICKNESS)
  const height = boundingRect.height.plus(STROKE_THICKNESS)
  const viewBox = getViewBox(boundingRect, STROKE_THICKNESS / 2)

  return (
    <ExportDrawAreaContext.Provider value={context}>
      <svg
        width={`${width.toString()}mm`}
        height={`${height.toString()}mm`}
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: 'block' }}
        viewBox={viewBox}
      >
        {layout.pages.map((page, pageIndex) => (
          <SvgExportPage key={pageIndex} page={page} />
        ))}
      </svg>
    </ExportDrawAreaContext.Provider>
  )
}
