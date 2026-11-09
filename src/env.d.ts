/// <reference types="vite/client" />

import type { FeatureFlagsSchema } from './common/schemas/featureFlags'

declare global {
  interface ImportMetaEnv {
    readonly VITE_IS_ELECTRON: string
    readonly FEATURE_FLAGS: FeatureFlagsSchema
  }
}
