import { VERSION } from '../../version'
import { HasVersionSchema } from '../schemas/common'
import type { DeepPartial } from '../schemas/migration'
import { isRecord } from '../utils/isRecord'
import { parseSemanticVersion } from '../utils/parseSemanticVersion'

export const m = {
  requireObject: <T extends object>(input: DeepPartial<T> | undefined): DeepPartial<T> => {
    if (!isRecord(input)) {
      throw new Error('Expected object')
    }

    return input as DeepPartial<T>
  },
  requireObjectField: <T extends object, Value extends object>(
    input: DeepPartial<T>,
    key: keyof T,
  ): DeepPartial<Value> => {
    const value = (input as Partial<T>)[key]

    if (!isRecord(value)) {
      throw new Error(`Expected ${String(key)} object`)
    }

    return value as DeepPartial<Value>
  },
  requireArray: <T extends object, Item extends object>(input: DeepPartial<T>, key: keyof T): DeepPartial<Item>[] => {
    const value = (input as Partial<T>)[key] as DeepPartial<Item>[] | undefined

    if (!Array.isArray(value)) {
      throw new Error(`Expected ${String(key)} array`)
    }

    return value
  },
  requireString: <T extends object>(input: DeepPartial<T>, key: keyof T): string => {
    const value = (input as Partial<T>)[key]
    if (typeof value !== 'string') {
      throw new Error(`Expected ${String(key)} string`)
    }

    return value as string
  },
  requirePrimitiveUnion: <T extends object, Value extends string>(
    input: DeepPartial<T>,
    key: keyof T,
    allowedValues: readonly Value[],
  ): Value => {
    const value = (input as Partial<T>)[key]
    if (!allowedValues.includes(value as Value)) {
      throw new Error(`Expected ${String(key)} to be one of ${allowedValues.join(', ')}`)
    }

    return value as Value
  },
  requireValue: <T extends object, Value>(input: DeepPartial<T>, key: keyof T, expectedValue: Value): Value => {
    if ((input as Partial<T>)[key] !== expectedValue) {
      throw new Error(`Expected ${String(key)} to equal ${String(expectedValue)}`)
    }

    return expectedValue
  },

  applyDefaults: <T extends object>(input: DeepPartial<T>, defaults: DeepPartial<T>): DeepPartial<T> => {
    const output = { ...input } as DeepPartial<T>
    const shallowOutput = output as Partial<T>
    const shallowDefaults = defaults as Partial<T>

    for (const key of Object.keys(defaults) as (keyof T)[]) {
      m.applyDefault(shallowOutput, shallowDefaults, key)
    }

    return output
  },

  applyDefault: <T extends object, Key extends keyof T>(output: Partial<T>, defaults: Partial<T>, key: Key): void => {
    if (typeof output[key] === 'undefined') {
      output[key] = defaults[key]
    }
  },
}

export const compareVersion = (projectVersion: string | undefined): number => {
  if (typeof projectVersion === 'undefined') {
    return -1
  }

  const projectParts = parseSemanticVersion(projectVersion)
  const appParts = parseSemanticVersion(VERSION)

  if (projectParts.major !== appParts.major) {
    return projectParts.major - appParts.major
  }
  if (projectParts.minor !== appParts.minor) {
    return projectParts.minor - appParts.minor
  }
  if (projectParts.patch !== appParts.patch) {
    return projectParts.patch - appParts.patch
  }

  return 0
}

export const migrateVersionedObject = <T extends HasVersionSchema>(
  input: unknown,
  migrator: (input: DeepPartial<T>) => DeepPartial<T>,
): DeepPartial<T> => {
  const value = m.requireObject(input as DeepPartial<T>)
  const comparison = compareVersion(value.version)

  if (comparison === 0) {
    return value
  }

  return migrator(value)
}
