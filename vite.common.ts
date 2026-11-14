import typia from '@typia/unplugin/vite'
import react from '@vitejs/plugin-react'
import type { BuildEnvironmentOptions, Plugin, UserConfig } from 'vite'
import svgr from 'vite-plugin-svgr'
import type { FeatureFlagsSchema } from './src/common/schemas/featureFlags'
import { parseFeatureFlag } from './src/common/utils/parseFeatureFlag'

export type ViteConfigOptions = {
  appEntry: string
  base: string
  contentSecurityPolicy?: string
  env: Record<string, string>
  isElectron: boolean
  port: number
}

const entry = (entryPath: string): Plugin => {
  return {
    name: 'app-entry',
    transformIndexHtml: {
      order: 'pre',
      handler() {
        return [{ tag: 'script', attrs: { type: 'module', src: entryPath }, injectTo: 'body' }]
      },
    },
  }
}

const contentSecurityPolicy = (policy: string): Plugin => {
  return {
    name: 'content-security-policy',
    transformIndexHtml: {
      order: 'pre',
      handler() {
        return [
          {
            tag: 'meta',
            attrs: {
              content: policy,
              'http-equiv': 'Content-Security-Policy',
            },
            injectTo: 'head',
          },
        ]
      },
    },
  }
}

export const createViteConfig = ({
  appEntry,
  base,
  contentSecurityPolicy: csp,
  env,
  isElectron,
  port,
}: ViteConfigOptions): Omit<UserConfig, 'build'> => {
  const featureFlags: FeatureFlagsSchema = {
    roundedStitchHoleRotationAdjustment: parseFeatureFlag(
      'FEATURE_FLAG_ROUNDED_STITCH_HOLE_ROTATION_ADJUSTMENT',
      env.FEATURE_FLAG_ROUNDED_STITCH_HOLE_ROTATION_ADJUSTMENT,
    ),
  }
  return {
    base,
    define: {
      'import.meta.env.FEATURE_FLAGS': JSON.stringify(featureFlags),
      'import.meta.env.VITE_IS_ELECTRON': JSON.stringify(isElectron ? 'true' : 'false'),
    },
    plugins: [
      entry(appEntry),
      ...(csp === undefined ? [] : [contentSecurityPolicy(csp)]),
      svgr({ svgrOptions: { exportType: 'named' } }),
      typia(),
      react(),
    ],
    server: {
      port,
      strictPort: true,
    },
  }
}

export const createMinifyOptions = (): BuildEnvironmentOptions => {
  return {
    minify: 'esbuild',
    sourcemap: true,
    cssMinify: 'esbuild',
  }
}

export const createChunks = (): Record<string, string[]> => {
  return {
    'react-core': ['react', 'react-dom/client'],
    'react-dom-server': ['react-dom/server'],
    'react-router': ['react-router'],
    'ui': ['@chakra-ui/react', '@emotion/react', '@dnd-kit/core'],
    'icons': ['react-icons/pi', 'react-icons/tb', 'country-flag-icons/react/1x1'],
    'react-pdf-renderer': ['@react-pdf/renderer'],
    'math': ['cavalier-contours-js', 'bignumber.js'],
    'state': ['jotai', 'jotai-family'],
    'utils': ['fflate', 'markdown-to-jsx/react', 'validator', 'culori', '@internationalized/number'],
  }
}
