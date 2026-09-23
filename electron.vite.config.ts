import typia from '@typia/unplugin/vite'
import { defineConfig } from 'electron-vite'
import { resolve } from 'node:path'
import type { Plugin } from 'vite'
import { version } from './package.json'
import { electronBuildTargets } from './src/electron/electron-api/buildPaths'
import { createViteConfig } from './vite.common'

const appTitle = (version: string): Plugin => {
  return {
    name: 'app-title',
    transformIndexHtml() {
      return [
        {
          tag: 'title',
          children: `Gomb v${version}`,
          injectTo: 'head',
        },
      ]
    },
  }
}

const developmentContentSecurityPolicy = `
  base-uri 'self';
  default-src 'self';
  script-src 'self' 'wasm-unsafe-eval';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: blob:;
  font-src 'self' data:;
  connect-src 'self' data: ws://localhost:4000;
  object-src 'none';
`

const productionContentSecurityPolicy = `
  base-uri 'self';
  default-src 'self';
  script-src 'self' 'wasm-unsafe-eval';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: blob:;
  font-src 'self' data:;
  connect-src 'self' data:;
  object-src 'none';
`

export default defineConfig(({ command }) => {
  const contentSecurityPolicy = command === 'serve' ? developmentContentSecurityPolicy : productionContentSecurityPolicy
  const rendererConfig = createViteConfig({
    appEntry: '/index.tsx',
    base: './',
    contentSecurityPolicy,
    isElectron: true,
    port: 4000,
  })

  return {
    main: {
      plugins: [typia()],
      build: {
        outDir: resolve(electronBuildTargets.main.outputDirectory),
        rollupOptions: {
          input: resolve(electronBuildTargets.main.sourcePath),
          output: {
            entryFileNames: electronBuildTargets.main.entryFileName,
          },
        },
      },
    },
    preload: {
      build: {
        outDir: resolve(electronBuildTargets.preload.outputDirectory),
        rollupOptions: {
          input: resolve(electronBuildTargets.preload.sourcePath),
          output: {
            entryFileNames: electronBuildTargets.preload.entryFileName,
            format: 'cjs',
          },
          treeshake: {
            moduleSideEffects: (moduleId: string): boolean => !moduleId.startsWith('node:'),
          },
        },
      },
    },
    renderer: {
      ...rendererConfig,
      plugins: [...(rendererConfig.plugins ?? []), appTitle(version)],
      root: resolve('src/electron'),
      build: {
        outDir: resolve(electronBuildTargets.renderer.outputDirectory),
        rollupOptions: {
          input: resolve(electronBuildTargets.renderer.sourcePath),
        },
      },
    },
  }
})
