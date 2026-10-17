import { useCallback, useEffect, useLayoutEffect, useRef } from 'react'

import { isDefined } from '../utils/isDefined'

export type UseThrottledCallbackResult<T extends unknown[], R> = {
  call: (...args: T) => R | undefined
  flush: () => R | undefined
  cancel: () => void
}

export const useThrottledCallback = <T extends unknown[], R>(
  callback: (...args: T) => R,
  throttle: number,
): UseThrottledCallbackResult<T, R> => {
  const callbackRef = useRef(callback)
  const lastCallTimeRef = useRef<number | undefined>(undefined)
  const pendingArgsRef = useRef<T | undefined>(undefined)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useLayoutEffect(() => {
    callbackRef.current = callback
  }, [callback])

  const flush = useCallback((): R | undefined => {
    clearTimeout(timeoutRef.current)
    timeoutRef.current = undefined
    const pendingArgs = pendingArgsRef.current

    if (!isDefined(pendingArgs)) {
      return
    }

    pendingArgsRef.current = undefined
    lastCallTimeRef.current = Date.now()
    return callbackRef.current(...pendingArgs)
  }, [])

  const cancel = useCallback((): void => {
    clearTimeout(timeoutRef.current)
    timeoutRef.current = undefined
    pendingArgsRef.current = undefined
    lastCallTimeRef.current = undefined
  }, [])

  const throttledCallback = useCallback(
    (...args: T): R | undefined => {
      const currentTime = Date.now()
      const lastCallTime = lastCallTimeRef.current

      if (!isDefined(lastCallTime) || currentTime - lastCallTime >= throttle) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = undefined
        pendingArgsRef.current = undefined
        lastCallTimeRef.current = currentTime
        return callbackRef.current(...args)
      }

      pendingArgsRef.current = args

      if (!isDefined(timeoutRef.current)) {
        timeoutRef.current = setTimeout(flush, throttle - (currentTime - lastCallTime))
      }
    },
    [flush, throttle],
  )

  useEffect(() => {
    return cancel
  }, [cancel, throttle])

  return { call: throttle === 0 ? callback : throttledCallback, flush, cancel }
}
