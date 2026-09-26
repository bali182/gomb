import { isDefined } from './isDefined'

export const isRecord = (value: unknown): value is Record<string, unknown> => {
  return isDefined(value) && typeof value === 'object' && !Array.isArray(value)
}
