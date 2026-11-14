import { isDefined } from './isDefined'

export const required = <T>(input: T | undefined, message?: string): NonNullable<T> => {
  if (!isDefined(input)) {
    throw new Error(message ?? 'cannot be null or undefined')
  }
  return input
}
