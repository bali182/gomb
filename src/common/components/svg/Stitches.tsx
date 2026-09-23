import { useMemo, type FC } from 'react'

import { useDrawAreaContext } from '../../contexts/DrawAreaContext'
import type { ComputedStitchSchema } from '../../schemas/computed'
import type { ResolvedStitchLineSchema } from '../../schemas/stitching'

type StitchesProps = {
  stitches: ComputedStitchSchema[]
  stitchLine: ResolvedStitchLineSchema
}

export const Stitches: FC<StitchesProps> = ({ stitches, stitchLine }) => {
  const { stitchLineStyles } = useDrawAreaContext()

  const pathData = useMemo<string>(
    () => stitches.map(({ line }) => `M ${line.start.x} ${line.start.y} L ${line.end.x} ${line.end.y}`).join(' '),
    [stitches],
  )

  if (stitches.length === 0) {
    return null
  }

  return (
    <path
      d={pathData}
      fill="none"
      stroke={stitchLineStyles.getThreadColor(stitchLine)}
      strokeLinecap="round"
      strokeWidth={stitchLineStyles.getThreadThickness(stitchLine)}
    />
  )
}
