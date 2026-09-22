import type { DeepPartial } from '../schemas/migration'
import { isRecord } from '../utils/isRecord'

export const m = {
  requireObject: <T extends object>(input: DeepPartial<T> | undefined): DeepPartial<T> => {
    if (!isRecord(input) || Array.isArray(input)) {
      throw new Error('Expected object')
    }

    return input as DeepPartial<T>
  },
  requireObjectField: <T extends object, Value extends object>(
    input: DeepPartial<T>,
    key: keyof T,
  ): DeepPartial<Value> => {
    const value = (input as Partial<T>)[key]

    if (!isRecord(value) || Array.isArray(value)) {
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
}
