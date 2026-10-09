import type { Resvg } from '@resvg/resvg-wasm'

import { MILLIMETERS_PER_INCH, PNG_DPI } from '../../constants/pngExport'
import type { SizeSchema } from '../../schemas/geometry'
import { isDefined } from '../../utils/isDefined'

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

type RenderSvgToPngParams = {
  svg: string
  size: SizeSchema
  background?: string
}

export const renderSvgToPng = async ({ svg, size, background }: RenderSvgToPngParams): Promise<Uint8Array> => {
  const resources = await getRendererResources()
  const width = Math.round(size.width.dividedBy(MILLIMETERS_PER_INCH).times(PNG_DPI).toNumber())
  const renderer = new resources.Resvg(svg, {
    dpi: PNG_DPI,
    fitTo: { mode: 'width', value: width },
    background,
    font: {
      fontBuffers: [resources.font],
      defaultFontFamily: 'Open Sans',
      sansSerifFamily: 'Open Sans',
    },
  })

  try {
    const image = renderer.render()
    try {
      return image.asPng()
    } finally {
      image.free()
    }
  } finally {
    renderer.free()
  }
}
