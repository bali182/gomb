export const isDefined = <T>(input: T | null | undefined): input is NonNullable<T> => {
  return input !== null && input !== undefined
}
