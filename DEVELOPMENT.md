# Development

## Environment configuration

The committed root `.env` contains build defaults for web and Electron. Use an
ignored `.env.local` in the same directory for local overrides:

```dotenv
VITE_BASE_PATH=/
FEATURE_FLAG_XXX=true
```

Vite loads these files in order, with later files overriding earlier ones:

1. `.env`
2. `.env.local`
3. `.env.[mode]`
4. `.env.[mode].local`

Existing process environment variables have the highest priority. CI uses the
committed defaults unless explicitly overridden. `.env.local` and
`.env.*.local` remain ignored by Git.

The web development server always uses `/` as its base; web builds use
`VITE_BASE_PATH`. Electron keeps its relative `./` base.

## Feature flags

Feature flags use the `FEATURE_FLAG_` prefix and the exact value `true` or
`false`. Missing or invalid values fail configuration loading. Flags are parsed
into typed booleans and embedded in the application and computation worker.
Restart development or rebuild after changing them.

To add a flag:

1. Add its default to `.env`.
2. Add its boolean field to `src/common/schemas/featureFlags.ts`.
3. Add its explicit `parseFeatureFlag` mapping in `vite.common.ts`.
4. Read it through the shared `featureFlags` export from
   `src/common/featureFlags.ts`.
