import {
  LoadableSchema,
  LoadableWithValueSchema,
  LoadedSchema,
  LoadingFailedSchema,
  LoadingFailedWithValueSchema,
  LoadingSchema,
  LoadingWithValueSchema,
  UninitializedSchema,
} from './schemas/loadable'

function hasValue<T>(loadable: LoadableSchema<T>): loadable is LoadableWithValueSchema<T> {
  return loadable.type === 'loaded' || loadable.type === 'loading-with-value' || loadable.type === 'failed-with-value'
}

function isSettled<T>(loadable: LoadableSchema<T>): boolean {
  return loadable.type === 'loaded' || loadable.type === 'failed' || loadable.type === 'failed-with-value'
}

function get<T>(loadable: LoadableSchema<T>): T | undefined
function get<T, F>(loadable: LoadableSchema<T>, fallback: F): T | F
function get<T, F>(loadable: LoadableSchema<T>, fallback?: F): T | F | undefined {
  return hasValue(loadable) ? loadable.data : fallback
}

const map = <I, O>(loadable: LoadableSchema<I>, transform: (data: I) => O): LoadableSchema<O> => {
  switch (loadable.type) {
    case 'uninitialized':
    case 'loading':
    case 'failed':
      return loadable
    case 'loading-with-value':
      return Loadable.loadingWith(transform(loadable.data))
    case 'failed-with-value':
      return Loadable.failedWith(transform(loadable.data), loadable.error)
    case 'loaded':
      return Loadable.loaded(transform(loadable.data))
  }
}

// If you want to use more strictly typed parameters, add another overload, DON'T use the base variant with any-s.
function merge<A, B, O>(
  loadables: [LoadableSchema<A>, LoadableSchema<B>],
  mergeFn: (a: A, b: B) => O,
): LoadableSchema<O>

function merge<A, B, C, O>(
  loadables: [LoadableSchema<A>, LoadableSchema<B>, LoadableSchema<C>],
  mergeFn: (a: A, b: B, c: C) => O,
): LoadableSchema<O>

function merge<A, B, C, D, O>(
  loadables: [LoadableSchema<A>, LoadableSchema<B>, LoadableSchema<C>, LoadableSchema<D>],
  mergeFn: (a: A, b: B, c: C, d: D) => O,
): LoadableSchema<O>

function merge(
  loadables: LoadableSchema<unknown>[],
  mergeFn: (...values: unknown[]) => unknown,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): LoadableSchema<any> {
  const failedWithValue = loadables.find((loadable) => loadable.type === 'failed-with-value')
  if (failedWithValue?.type === 'failed-with-value') {
    if (!loadables.every(hasValue)) {
      return Loadable.failed(failedWithValue.error)
    }
    try {
      return Loadable.failedWith(mergeFn(...loadables.map((loadable) => get(loadable))), failedWithValue.error)
    } catch (error) {
      return Loadable.failed(error)
    }
  }

  let state: 'failed' | 'loading' | undefined = undefined
  let eachHasValue = true
  for (const loadable of loadables) {
    // If there is an uninitialized loadable, loading did not yet occur, we take it as loading. No better option.
    if (loadable.type === 'uninitialized') {
      state = 'loading'
      eachHasValue = false
      break
    }
    // If there is an error, no reason to check further
    if (loadable.type === 'failed') {
      state = 'failed'
      eachHasValue = false
      break
    }
    // If there is a loading loadable, no reason to check further
    if (loadable.type === 'loading') {
      state = 'loading'
      eachHasValue = false
      break
    }
    // If it's loading with value, we set to loading, but don't break, and don't set eachHasValue to false
    if (loadable.type === 'loading-with-value') {
      state = 'loading'
    }
  }
  // If either loadable failed, return failed
  if (state === 'failed') {
    return Loadable.failed()
  }
  try {
    // If either loadable is loading, only merge them if each has a value
    if (state === 'loading') {
      return eachHasValue
        ? Loadable.loadingWith(mergeFn(...(loadables as LoadableWithValueSchema<unknown>[]).map((l) => l.data)))
        : Loadable.loading()
    }
    // All loadables are loaded and have a value
    return Loadable.loaded(mergeFn(...(loadables as LoadableWithValueSchema<unknown>[]).map((l) => l.data)))
  } catch (e) {
    return Loadable.failed(e)
  }
}

export const Loadable = {
  // Factories
  uninitialized: (): UninitializedSchema => {
    return { type: 'uninitialized' }
  },
  loading: (): LoadingSchema => {
    return { type: 'loading' }
  },
  loadingWith: <T>(data: T): LoadingWithValueSchema<T> => {
    return { type: 'loading-with-value', data }
  },
  failed: (error?: unknown): LoadingFailedSchema => {
    return { type: 'failed', error }
  },
  failedWith: <T>(data: T, error: unknown): LoadingFailedWithValueSchema<T> => {
    return { type: 'failed-with-value', data, error }
  },
  loaded: <T>(data: T): LoadedSchema<T> => {
    return { type: 'loaded', data }
  },

  // Functional utilities
  get,
  hasValue,
  isSettled,
  map,
  merge,
}
