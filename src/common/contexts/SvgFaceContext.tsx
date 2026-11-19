import { createContext, useContext } from 'react'
import { isDefined } from '../utils/isDefined'

export type SvgViewDirection = 'forward' | 'reverse'

export type SvgFaceContextValue = {
  faceId: string
  direction: SvgViewDirection
}

export const SvgFaceContext = createContext<SvgFaceContextValue | undefined>(undefined)

export const useOptionalSvgFace = (): SvgFaceContextValue | undefined => useContext(SvgFaceContext)

export const useSvgFace = (): SvgFaceContextValue => {
  const view = useOptionalSvgFace()
  if (!isDefined(view)) {
    throw new Error('useSvgFace requires SvgFaceContext')
  }
  return view
}
