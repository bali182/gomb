import type { FeatureFlagsSchema } from './schemas/featureFlags'

export const featureFlags: FeatureFlagsSchema = import.meta.env.FEATURE_FLAGS
