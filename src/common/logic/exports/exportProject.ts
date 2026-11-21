import type { ExportFormatSchema, ExportParamsSchema } from '../../schemas/export'
import { exportPng } from './exportPng'
import { exportSvg } from './exportSvg'

export type ExportProjectParamsSchema = ExportParamsSchema & {
  format: ExportFormatSchema
}

export const exportProject = async (params: ExportProjectParamsSchema): Promise<void> => {
  switch (params.format) {
    case 'pdf': {
      const { exportPdf } = await import('./exportPdf')
      await exportPdf(params)
      break
    }
    case 'svg':
      exportSvg(params)
      break
    case 'png':
      await exportPng(params)
      break
  }
}
