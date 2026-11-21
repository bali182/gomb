import type BigNumber from 'bignumber.js'
import { useMemo, type FC } from 'react'

import { useDrawAreaContext } from '../../contexts/DrawAreaContext'
import { getSvgLinePathData } from '../../logic/getSvgPathData'
import type { ComputedStitchSchema } from '../../schemas/computed'
import type { ResolvedStitchLineSchema } from '../../schemas/stitching'

type StitchesProps = {
  stitches: ComputedStitchSchema[]
  reflectionAxisX?: BigNumber
  stitchLine: ResolvedStitchLineSchema
}

export const Stitches: FC<StitchesProps> = ({ stitches, stitchLine, reflectionAxisX }) => {
  const { stitchLineStyles } = useDrawAreaContext()

  const pathData = useMemo<string>(
    () => stitches.map(({ line }) => getSvgLinePathData(line, reflectionAxisX)).join(' '),
    [stitches, reflectionAxisX],
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
