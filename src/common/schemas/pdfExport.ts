import BigNumber from 'bignumber.js'
import { HasTypeSchema } from './common'
import { RectSchema } from './geometry'
import { PageSchemaId } from './page'
import { BaseExportSettingsSchema } from './settings'
import type { SvgExportElementSchema } from './svgExport'
import { SvgExportPanelSchema } from './svgExport'

export type PageOrientationSchema = 'portrait' | 'landscape'
export type PageLayoutSchema = 'vertical' | 'horizontal' | 'compact'
export type PdfExportPlacementRotation = 0 | 90

export type PdfExportSettingsSchema = BaseExportSettingsSchema & {
  page: PageSchemaId
  orientation: PageOrientationSchema
  layout: PageLayoutSchema
}

export type PdfExportPlacementSchema = {
  boundingRect: RectSchema
  /** The page-space footprint after compact-layout rotation. */
  placementBoundingRect: RectSchema
  rotation: PdfExportPlacementRotation
  x: BigNumber
  y: BigNumber
}

export type PdfExportElement = {
  element: SvgExportElementSchema
  placement: PdfExportPlacementSchema
}

export type PdfExportPageSchema = {
  elements: PdfExportElement[]
}

export type PdfExportSuccessfulLayoutSchema = HasTypeSchema<'successful-pdf-export'> & {
  pages: PdfExportPageSchema[]
}

export type PdfExportUnsuccessfulLayoutSchema = HasTypeSchema<'unsuccessful-pdf-export'> & {
  unplaceables: SvgExportPanelSchema[]
}

export type PdfExportLayoutSchema = PdfExportSuccessfulLayoutSchema | PdfExportUnsuccessfulLayoutSchema
