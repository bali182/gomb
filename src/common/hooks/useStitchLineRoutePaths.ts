import type BigNumber from 'bignumber.js'
import { useMemo } from 'react'
import { getSvgLinePathData } from '../logic/getSvgPathData'
import type { ComputedStitchRouteSchema } from '../schemas/computed'
import { useGlobalSettings } from './useGlobalSettings'
import { usePath } from './usePath'

type StitchLineRoutePaths = {
  stitchLinePath: string
  stitchHolesPath?: string
  threadPath?: string
}

export const useStitchLineRoutePaths = (
  route: ComputedStitchRouteSchema,
  reflectionAxisX?: BigNumber,
): StitchLineRoutePaths => {
  const { settings } = useGlobalSettings()
  const stitchLinePath = usePath(route.path, reflectionAxisX)

  const stitchHolesPath = useMemo<string | undefined>(() => {
    if (!settings.view.stitchHolesVisible || route.holes.length === 0) {
      return undefined
    }
    return route.holes.map(({ line }) => getSvgLinePathData(line, reflectionAxisX)).join(' ')
  }, [route.holes, reflectionAxisX, settings.view.stitchHolesVisible])

  const threadPath = useMemo<string | undefined>(() => {
    if (!settings.view.stitchesVisible || route.stitches.length === 0) {
      return undefined
    }
    return route.stitches.map(({ line }) => getSvgLinePathData(line, reflectionAxisX)).join(' ')
  }, [route.stitches, reflectionAxisX, settings.view.stitchesVisible])

  return { stitchLinePath, stitchHolesPath, threadPath }
}
