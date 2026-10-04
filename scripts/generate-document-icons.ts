import { initWasm, Resvg } from '@resvg/resvg-wasm'
import { execFile } from 'node:child_process'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { resolve } from 'node:path'
import { promisify } from 'node:util'

type IconImage = { size: number; png: Buffer }

const ICON_SIZES = [16, 32, 48, 64, 128, 256, 512, 1024] as const
const OUTPUT_DIRECTORY = resolve('out/document-icons')
const executeFile = promisify(execFile)

async function renderLogo(svg: string): Promise<IconImage[]> {
  const require = createRequire(import.meta.url)
  const wasm = await readFile(require.resolve('@resvg/resvg-wasm/index_bg.wasm'))
  await initWasm(new Uint8Array(wasm))

  return ICON_SIZES.map((size: number): IconImage => {
    const renderer = new Resvg(svg.replace(/currentColor/g, '#000000'), {
      fitTo: { mode: 'width', value: size },
    })
    try {
      const image = renderer.render()
      try {
        return { size, png: Buffer.from(image.asPng()) }
      } finally {
        image.free()
      }
    } finally {
      renderer.free()
    }
  })
}

function createIco(images: readonly IconImage[]): Buffer {
  const frames = images.filter((image: IconImage): boolean => image.size <= 256)
  const header = Buffer.alloc(6 + frames.length * 16)
  header.writeUInt16LE(1, 2)
  header.writeUInt16LE(frames.length, 4)
  let offset = header.length
  frames.forEach((image: IconImage, index: number): void => {
    const entry = 6 + index * 16
    header.writeUInt8(image.size === 256 ? 0 : image.size, entry)
    header.writeUInt8(image.size === 256 ? 0 : image.size, entry + 1)
    header.writeUInt16LE(1, entry + 4)
    header.writeUInt16LE(32, entry + 6)
    header.writeUInt32LE(image.png.length, entry + 8)
    header.writeUInt32LE(offset, entry + 12)
    offset += image.png.length
  })
  return Buffer.concat([header, ...frames.map((image: IconImage): Buffer => image.png)])
}

async function generateMacIcon(images: readonly IconImage[]): Promise<void> {
  const catalogPath = resolve(OUTPUT_DIRECTORY, 'Assets.xcassets')
  const iconsetPath = resolve(catalogPath, 'GombDocumentLogo.iconset')
  await mkdir(iconsetPath, { recursive: true })
  await writeFile(resolve(catalogPath, 'Contents.json'), JSON.stringify({ info: { author: 'xcode', version: 1 } }))
  for (const size of [16, 32, 128, 256, 512]) {
    for (const scale of [1, 2]) {
      const image = images.find((candidate: IconImage): boolean => candidate.size === size * scale)
      if (image === undefined) {
        throw new Error(`Missing logo image: ${size * scale}px`)
      }
      const name = `icon_${size}x${size}${scale === 2 ? '@2x' : ''}.png`
      await writeFile(resolve(iconsetPath, name), image.png)
    }
  }
  await executeFile('xcrun', [
    'actool',
    '--compile',
    OUTPUT_DIRECTORY,
    '--platform',
    'macosx',
    '--minimum-deployment-target',
    '11.0',
    catalogPath,
  ])
  await readFile(resolve(OUTPUT_DIRECTORY, 'Assets.car'))
}

async function generateWindowsIcon(images: readonly IconImage[]): Promise<void> {
  const sourcePath = resolve(OUTPUT_DIRECTORY, 'logo.ico')
  await writeFile(sourcePath, createIco(images))
  await executeFile('powershell.exe', [
    '-NoProfile',
    '-NonInteractive',
    '-File',
    resolve('scripts/generate-windows-document-icon.ps1'),
    '-SourcePath',
    sourcePath,
    '-DestinationPath',
    resolve(OUTPUT_DIRECTORY, 'gomb.ico'),
  ])
}

async function generateDocumentIcons(): Promise<void> {
  if (process.platform !== 'darwin' && process.platform !== 'win32') {
    throw new Error(`Unsupported document icon platform: ${process.platform}`)
  }
  await mkdir(OUTPUT_DIRECTORY, { recursive: true })
  const images = await renderLogo(await readFile(resolve('logo.svg'), 'utf8'))
  if (process.platform === 'darwin') {
    await generateMacIcon(images)
  } else {
    await generateWindowsIcon(images)
  }
  console.log(`Document icons generated in ${OUTPUT_DIRECTORY}`)
}

await generateDocumentIcons()
