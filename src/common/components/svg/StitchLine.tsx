import type { FC } from 'react'

import type { ComputedStitchLineSchema } from '../../schemas/computed'
import type { ResolvedStitchLineSchema } from '../../schemas/stitching'
import { StitchLineRoute } from './StitchLineRoute'

type StitchLineProps = {
  computedStitchLine: ComputedStitchLineSchema
  stitchLine: ResolvedStitchLineSchema
}

export const StitchLine: FC<StitchLineProps> = ({ computedStitchLine, stitchLine }) => {
  return (
    <>
      {computedStitchLine.routes.map((route, index) => (
        <StitchLineRoute key={index} route={route} stitchLine={stitchLine} />
      ))}
    </>
  )
}
