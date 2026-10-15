import { useCallback, useEffect, useLayoutEffect, useRef } from 'react'

import { isDefined } from '../utils/isDefined'

export type UseThrottledCallbackResult<T extends unknown[]> = {
  call: (...args: T) => void
  flush: () => void
}

export const useThrottledCallback = <T extends unknown[]>(
  callback: (...args: T) => void,
  throttle: number,
): UseThrottledCallbackResult<T> => {
  const callbackRef = useRef(callback)
  const lastCallTimeRef = useRef<number | undefined>(undefined)
  const pendingArgsRef = useRef<T | undefined>(undefined)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useLayoutEffect(() => {
    callbackRef.current = callback
  }, [callback])

  const flush = useCallback((): void => {
    clearTimeout(timeoutRef.current)
    timeoutRef.current = undefined
    const pendingArgs = pendingArgsRef.current

    if (!isDefined(pendingArgs)) {
      return
    }

    pendingArgsRef.current = undefined
    lastCallTimeRef.current = Date.now()
    callbackRef.current(...pendingArgs)
  }, [])

  const throttledCallback = useCallback(
    (...args: T): void => {
      const currentTime = Date.now()
      const lastCallTime = lastCallTimeRef.current

      if (!isDefined(lastCallTime) || currentTime - lastCallTime >= throttle) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = undefined
        pendingArgsRef.current = undefined
        lastCallTimeRef.current = currentTime
        callbackRef.current(...args)
        return
      }

      pendingArgsRef.current = args

      if (!isDefined(timeoutRef.current)) {
        timeoutRef.current = setTimeout(flush, throttle - (currentTime - lastCallTime))
      }
    },
    [flush, throttle],
  )

  useEffect(() => {
    return (): void => {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = undefined
      pendingArgsRef.current = undefined
      lastCallTimeRef.current = undefined
    }
  }, [throttle])

  return { call: throttle === 0 ? callback : throttledCallback, flush }
}
