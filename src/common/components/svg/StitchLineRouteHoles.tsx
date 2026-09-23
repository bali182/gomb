import { useMemo, type FC } from 'react'

import { useDrawAreaContext } from '../../contexts/DrawAreaContext'
import type { ComputedStitchHoleSchema } from '../../schemas/computed'
import type { ResolvedStitchLineSchema } from '../../schemas/stitching'

type StitchLineRouteHolesProps = {
  holes: ComputedStitchHoleSchema[]
  stitchLine: ResolvedStitchLineSchema
}

export const StitchLineRouteHoles: FC<StitchLineRouteHolesProps> = ({ holes, stitchLine }) => {
  const { stitchLineStyles } = useDrawAreaContext()

  const pathData = useMemo<string>(
    () => holes.map(({ line }) => `M ${line.start.x} ${line.start.y} L ${line.end.x} ${line.end.y}`).join(' '),
    [holes],
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
