import { createContext, useContext } from 'react'
import { STROKE_COLOR, STROKE_THICKNESS } from '../constants/drawing'
import {
  EXPORT_PREVIEW_SHADOW_BLUR,
  EXPORT_PREVIEW_SHADOW_COLOR,
  EXPORT_PREVIEW_SHADOW_OFFSET_X,
  EXPORT_PREVIEW_SHADOW_OFFSET_Y,
  EXPORT_PREVIEW_SHADOW_OPACITY,
} from '../constants/exportPreview'

export type ExportPreviewContextValue = {
  isPreview: boolean
  strokeWidth: number
  pageShadowOffsetX: number
  pageShadowOffsetY: number
  pageShadowBlur: number
  pageShadowColor: string
  pageShadowOpacity: number
  pageStrokeColor: string
  errorStrokeColor: string
  nameWidthRatio: number
  parentNameWidthRatio: number
  sizeWidthRatio: number
}

export const defaultExportPreviewContext: ExportPreviewContextValue = {
  isPreview: false,
  strokeWidth: STROKE_THICKNESS,
  pageShadowOffsetX: EXPORT_PREVIEW_SHADOW_OFFSET_X,
  pageShadowOffsetY: EXPORT_PREVIEW_SHADOW_OFFSET_Y,
  pageShadowBlur: EXPORT_PREVIEW_SHADOW_BLUR,
  pageShadowColor: EXPORT_PREVIEW_SHADOW_COLOR,
  pageShadowOpacity: EXPORT_PREVIEW_SHADOW_OPACITY,
  pageStrokeColor: STROKE_COLOR,
  errorStrokeColor: '#dc2626',
  nameWidthRatio: 0.5,
  parentNameWidthRatio: 0.4,
  sizeWidthRatio: 0.4,
}

export const ExportPreviewContext = createContext<ExportPreviewContextValue>(defaultExportPreviewContext)

export const useExportPreview = (): ExportPreviewContextValue => useContext(ExportPreviewContext)
