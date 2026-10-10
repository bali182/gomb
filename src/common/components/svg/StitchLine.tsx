import type { FC } from 'react'

import { useDrawAreaContext } from '../../contexts/DrawAreaContext'
import { useGlobalSettings } from '../../hooks/useGlobalSettings'
import type { ComputedStitchLineSchema } from '../../schemas/computed'
import type { ResolvedStitchLineSchema } from '../../schemas/stitching'
import { StitchLineRoute } from './StitchLineRoute'
import { Stitches } from './Stitches'

type StitchLineProps = {
  computedStitchLine: ComputedStitchLineSchema
  stitchLine: ResolvedStitchLineSchema
  maskId?: string
}

export const StitchLine: FC<StitchLineProps> = ({ computedStitchLine, stitchLine, maskId }) => {
  const { settings } = useGlobalSettings()
  const { selection } = useDrawAreaContext()
  const isActive = selection.isSelected(stitchLine) || selection.isHovered(stitchLine)

  return (
    <g mask={isActive || maskId === undefined ? undefined : `url(#${maskId})`}>
      {computedStitchLine.routes.map((route, index) => (
        <StitchLineRoute key={index} route={route} stitchLine={stitchLine} />
      ))}
      {settings.view.stitchesVisible && (
        <Stitches stitches={computedStitchLine.connectingStitches} stitchLine={stitchLine} />
      )}
    </g>
  )
}
