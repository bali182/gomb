import type { ExportElementSchema } from '../../schemas/export'
import type { RectSchema } from '../../schemas/geometry'

export type ExportLayoutElement = {
  element: ExportElementSchema
  boundingRect: RectSchema
  isOversized: boolean
}
