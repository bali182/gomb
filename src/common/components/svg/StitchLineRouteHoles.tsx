import type BigNumber from 'bignumber.js'
import { useMemo, type FC } from 'react'

import { useDrawAreaContext } from '../../contexts/DrawAreaContext'
import { getSvgLinePathData } from '../../logic/getSvgPathData'
import type { ComputedStitchHoleSchema } from '../../schemas/computed'
import type { ResolvedStitchLineSchema } from '../../schemas/stitching'

type StitchLineRouteHolesProps = {
  holes: ComputedStitchHoleSchema[]
  reflectionAxisX?: BigNumber
  stitchLine: ResolvedStitchLineSchema
}

export const StitchLineRouteHoles: FC<StitchLineRouteHolesProps> = ({ holes, stitchLine, reflectionAxisX }) => {
  const { stitchLineStyles } = useDrawAreaContext()

  const pathData = useMemo<string>(
    () => holes.map(({ line }) => getSvgLinePathData(line, reflectionAxisX)).join(' '),
    [holes, reflectionAxisX],
  )

  if (holes.length === 0) {
    return null
  }

  return (
    <path
      d={pathData}
      fill="none"
      strokeLinecap="round"
      stroke={stitchLineStyles.getStitchHoleColor(stitchLine)}
      strokeWidth={stitchLineStyles.getStitchHoleThickness(stitchLine)}
    />
  )
}
