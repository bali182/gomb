import { Box, Button, Spinner } from '@chakra-ui/react'
import BigNumber from 'bignumber.js'
import { useMemo, type FC } from 'react'
import { PiWarningCircle } from 'react-icons/pi'
import {
  EXPORT_PREVIEW_BORDER_WIDTH,
  EXPORT_PREVIEW_PADDING,
  EXPORT_PREVIEW_STROKE_WIDTH,
  EXPORT_PREVIEW_WIDTH,
} from '../../constants/exportPreview'
import { EXPORT_PAGE_GAP } from '../../constants/layout'
import { ExportDrawAreaContext } from '../../contexts/ExportDrawAreaContext'
import {
  defaultExportPreviewContext,
  ExportPreviewContext,
  type ExportPreviewContextValue,
} from '../../contexts/ExportPreviewContext'
import { useTranslation } from '../../hooks/useTranslation'
import type { DrawAreaContextValue } from '../../schemas/drawArea'
import type { ExportLayoutSchema, ExportPageSchema } from '../../schemas/export'
import type { RectSchema, SizeSchema } from '../../schemas/geometry'
import type { LoadableSchema } from '../../schemas/loadable'
import { getViewBox } from '../../utils/getViewBox'
import { CommonEmptyState } from '../common/CommonEmptyState'
import { SvgExportPage } from '../svg-export/SvgExportPage'

type ExportPreviewProps = {
  layout: LoadableSchema<ExportLayoutSchema>
  pageSize: SizeSchema
  context: DrawAreaContextValue
  onRetry: () => void
}

export const ExportPreview: FC<ExportPreviewProps> = ({ layout, pageSize, context, onRetry }) => {
  const { t } = useTranslation()
  const scale =
    (EXPORT_PREVIEW_WIDTH - EXPORT_PREVIEW_BORDER_WIDTH - 2 * EXPORT_PREVIEW_PADDING) /
    Math.max(pageSize.width.toNumber(), pageSize.height.toNumber())

  switch (layout.type) {
    case 'failed':
    case 'failed-with-value':
      return (
        <CommonEmptyState
          icon={<PiWarningCircle />}
          title={t.dialogs.export.preparationFailed.title}
          description={t.dialogs.export.preparationFailed.description}
          content={
            <Button onClick={onRetry} size="xs">
              {t.dialogs.export.preparationFailed.action}
            </Button>
          }
        />
      )
    case 'uninitialized':
    case 'loading':
    case 'loading-with-value':
      return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="32" height="100%">
          <Spinner />
        </Box>
      )
    case 'loaded':
      return (
        <ExportDrawAreaContext.Provider value={context}>
          {layout.data.pages.map((page, index) => (
            <ExportPreviewPage key={index} page={page} scale={scale} />
          ))}
        </ExportDrawAreaContext.Provider>
      )
  }
}

type ExportPreviewPageProps = {
  page: ExportPageSchema
  scale: number
}

const ExportPreviewPage: FC<ExportPreviewPageProps> = ({ page, scale }) => {
  const preview = useMemo<ExportPreviewContextValue>(
    () => ({
      ...defaultExportPreviewContext,
      isPreview: true,
      strokeWidth: EXPORT_PREVIEW_STROKE_WIDTH / scale,
      pageShadowOffsetX: defaultExportPreviewContext.pageShadowOffsetX / scale,
      pageShadowOffsetY: defaultExportPreviewContext.pageShadowOffsetY / scale,
      pageShadowBlur: defaultExportPreviewContext.pageShadowBlur / scale,
    }),
    [scale],
  )

  const bounds = useMemo<RectSchema>(() => {
    const paper = page.boundingRect
    const strokePadding = new BigNumber(preview.strokeWidth).dividedBy(2)
    let left = paper.x
    let top = paper.y
    let right = paper.x.plus(paper.width)
    let bottom = paper.y.plus(paper.height)
    for (const { placement } of page.elements) {
      const rect = placement.placementBoundingRect
      left = BigNumber.minimum(left, rect.x.minus(strokePadding))
      top = BigNumber.minimum(top, rect.y.minus(strokePadding))
      right = BigNumber.maximum(right, rect.x.plus(rect.width).plus(strokePadding))
      bottom = BigNumber.maximum(bottom, rect.y.plus(rect.height).plus(strokePadding))
    }
    return { x: left, y: top, width: right.minus(left), height: bottom.minus(top) }
  }, [page, preview.strokeWidth])

  const left =
    (EXPORT_PREVIEW_WIDTH -
      EXPORT_PREVIEW_BORDER_WIDTH -
      2 * EXPORT_PREVIEW_PADDING -
      page.boundingRect.width.toNumber() * scale) /
      2 +
    bounds.x.minus(page.boundingRect.x).toNumber() * scale

  return (
    <Box marginLeft={`${left}px`} width="fit-content" marginBottom={`${EXPORT_PAGE_GAP * scale}px`}>
      <ExportPreviewContext.Provider value={preview}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={bounds.width.toNumber() * scale}
          height={bounds.height.toNumber() * scale}
          viewBox={getViewBox(bounds, 0)}
          style={{ display: 'block', maxWidth: 'none', overflow: 'visible' }}
        >
          <SvgExportPage page={page} />
        </svg>
      </ExportPreviewContext.Provider>
    </Box>
  )
}
