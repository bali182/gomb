import { PNG_EXTENSION, ZIP_EXTENSION } from '../../constants/fileExtensions'
import type { ExportParamsSchema } from '../../schemas/export'
import { downloadBlob } from '../../utils/downloadBlob'
import { renderSvgPageToString } from './renderSvgPageToString'
import { renderSvgToPng } from './renderSvgToPng'

export const exportPng = async ({
  layout,
  pageSize,
  context,
  projectName,
  translation,
}: ExportParamsSchema): Promise<void> => {
  if (layout.pages.length === 0) {
    throw new Error('Cannot export PNG without pages')
  }

  const images: Uint8Array[] = []

  for (const page of layout.pages) {
    const svg = renderSvgPageToString({ page, pageSize, context })
    images.push(await renderSvgToPng({ svg, size: pageSize, background: '#ffffff' }))
  }

  if (images.length === 1) {
    downloadBlob(new Blob([new Uint8Array(images[0])], { type: 'image/png' }), `${projectName}.${PNG_EXTENSION}`)
    return
  }

  const { zipSync } = await import('fflate/browser')
  const files: Record<string, Uint8Array> = {}

  images.forEach((image, pageIndex): void => {
    const name = translation.project.export.pageName(projectName, pageIndex + 1)
    files[`${name}.${PNG_EXTENSION}`] = image
  })

  const archive = zipSync(files, { level: 0 })
  downloadBlob(new Blob([new Uint8Array(archive)], { type: 'application/zip' }), `${projectName}.${ZIP_EXTENSION}`)
}
