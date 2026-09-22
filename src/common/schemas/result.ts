export type SuccessResultSchema<T> = {
  type: 'success'
  value: T
}

export type ErrorResultSchema<E> = {
  type: 'error'
  error: E
}

export type ResultSchema<T, E> = SuccessResultSchema<T> | ErrorResultSchema<E>
