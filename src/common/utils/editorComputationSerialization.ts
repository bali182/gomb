import BigNumber from 'bignumber.js'

import { isDefined } from './isDefined'

const SERIALIZED_BIG_NUMBER_KEY = '$bigNumber'

export const serializeEditorComputation = (value: unknown): string => {
  return JSON.stringify(value, function (key, serialized: unknown): unknown {
    const original: unknown = this[key]
    return BigNumber.isBigNumber(original) ? { [SERIALIZED_BIG_NUMBER_KEY]: original.toJSON() } : serialized
  })
}

export const deserializeEditorComputation = <T>(serialized: string): T => {
  return JSON.parse(serialized, (_key, value: unknown): unknown => {
    if (
      typeof value === 'object' &&
      isDefined(value) &&
      SERIALIZED_BIG_NUMBER_KEY in value &&
      typeof value.$bigNumber === 'string'
    ) {
      return new BigNumber(value.$bigNumber)
    }
    return value
  }) as T
}
