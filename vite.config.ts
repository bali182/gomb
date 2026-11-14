import { resolve } from 'node:path'
import { defineConfig, loadEnv } from 'vite'
import { createChunks, createMinifyOptions, createViteConfig } from './vite.common'

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const base = command === 'build' ? (env.VITE_BASE_PATH ?? '/') : '/'

  return {
    ...createViteConfig({
      appEntry: '/index.tsx',
      base,
      env,
      isElectron: false,
      port: 3000,
    }),
    build: {
      ...(command === 'build' ? createMinifyOptions() : undefined),
      emptyOutDir: true,
      outDir: resolve('dist'),
      ...(command === 'build'
        ? {
            rollupOptions: {
              output: {
                manualChunks: createChunks(),
              },
            },
          }
        : undefined),
    },
    publicDir: resolve('public'),
    root: resolve('src/web'),
  }
})
