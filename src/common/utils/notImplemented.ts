export const notImplemented =
  (message: string = 'Not implemented') =>
  () => {
    throw new Error(message)
  }
