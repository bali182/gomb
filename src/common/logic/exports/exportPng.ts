import type { Resvg } from '@resvg/resvg-wasm'

import { PNG_EXTENSION, ZIP_EXTENSION } from '../../constants/fileExtensions'
import type { ExportParamsSchema } from '../../schemas/export'
import { downloadBlob } from '../../utils/downloadBlob'
import { isDefined } from '../../utils/isDefined'
import { renderSvgPageToString } from './renderSvgPageToString'

const PNG_DPI = 300
const MILLIMETERS_PER_INCH = 25.4

type PngRendererResources = {
  Resvg: typeof Resvg
  font: Uint8Array
}

let rendererResourcesPromise: Promise<PngRendererResources> | undefined

const loadRendererResources = async (): Promise<PngRendererResources> => {
  const [resvg, wasmAsset, fontAsset] = await Promise.all([
    import('@resvg/resvg-wasm'),
    import('@resvg/resvg-wasm/index_bg.wasm?url'),
    import('open-sans-fonts/open-sans/Regular/OpenSans-Regular.ttf?url'),
  ])
  const [wasmResponse, fontResponse] = await Promise.all([fetch(wasmAsset.default), fetch(fontAsset.default)])

  if (!wasmResponse.ok || !fontResponse.ok) {
    throw new Error('Unable to load PNG renderer resources')
  }

  const [wasm, font] = await Promise.all([wasmResponse.arrayBuffer(), fontResponse.arrayBuffer()])
  await resvg.initWasm(wasm)

  return { Resvg: resvg.Resvg, font: new Uint8Array(font) }
}

const getRendererResources = async (): Promise<PngRendererResources> => {
  if (!isDefined(rendererResourcesPromise)) {
    rendererResourcesPromise = loadRendererResources()
  }

  try {
    return await rendererResourcesPromise
  } catch (error) {
    rendererResourcesPromise = undefined
    throw error
  }
}

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

  const resources = await getRendererResources()
  const width = Math.round(pageSize.width.dividedBy(MILLIMETERS_PER_INCH).times(PNG_DPI).toNumber())
  const images: Uint8Array[] = []

  for (const page of layout.pages) {
    const svg = renderSvgPageToString({ page, pageSize, context })
    const renderer = new resources.Resvg(svg, {
      dpi: PNG_DPI,
      fitTo: { mode: 'width', value: width },
      background: '#ffffff',
      font: {
        fontBuffers: [resources.font],
        defaultFontFamily: 'Open Sans',
        sansSerifFamily: 'Open Sans',
      },
    })

    try {
      const image = renderer.render()
      try {
        images.push(image.asPng())
      } finally {
        image.free()
      }
    } finally {
      renderer.free()
    }
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
