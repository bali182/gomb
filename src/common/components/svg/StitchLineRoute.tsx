import { useCallback, type FC, type MouseEventHandler, type PointerEventHandler } from 'react'

import { useDrawAreaContext } from '../../contexts/DrawAreaContext'
import { useGlobalSettings } from '../../hooks/useGlobalSettings'
import { usePath } from '../../hooks/usePath'
import type { ComputedStitchRouteSchema } from '../../schemas/computed'
import type { ResolvedStitchLineSchema } from '../../schemas/stitching'
import { StitchLineRouteHoles } from './StitchLineRouteHoles'
import { StitchRouteLabel } from './StitchRouteLabel'
import { Stitches } from './Stitches'

type StitchLineRouteProps = {
  route: ComputedStitchRouteSchema
  stitchLine: ResolvedStitchLineSchema
}

export const StitchLineRoute: FC<StitchLineRouteProps> = ({ route, stitchLine }) => {
  const { isInteractive, selection, stitchLineStyles } = useDrawAreaContext()
  const { settings } = useGlobalSettings()
  const pathData = usePath(route.path)
  const stitchLineThickness = stitchLineStyles.getLineThickness(stitchLine)
  const stitchHoleThickness = stitchLineStyles.getStitchHoleThickness(stitchLine)
  const isStitchLineActive = selection.isSelected(stitchLine) || selection.isHovered(stitchLine)
  const hitAreaThickness =
    1 + Math.max(stitchLineThickness ?? 0, stitchLine.stitchHoleLength / Math.SQRT2 + (stitchHoleThickness ?? 0))

  const handlePointerEnter = useCallback<PointerEventHandler<SVGGElement>>(() => {
    selection.hover(stitchLine)
  }, [selection, stitchLine])

  const handlePointerLeave = useCallback<PointerEventHandler<SVGGElement>>(
    (event) => {
      if (isSameStitchLineRoute(event.relatedTarget, stitchLine.id)) {
        return
      }
      selection.clearHover()
    },
    [selection, stitchLine.id],
  )

  const handleClick = useCallback<MouseEventHandler<SVGGElement>>(
    (event) => {
      event.stopPropagation()
      selection.select(stitchLine)
    },
    [selection, stitchLine],
  )

  return (
    <g
      data-stitch-line-id={stitchLine.id}
      onClick={isInteractive ? handleClick : undefined}
      onPointerEnter={isInteractive ? handlePointerEnter : undefined}
      onPointerLeave={isInteractive ? handlePointerLeave : undefined}
    >
      {(!isInteractive || settings.view.stitchLinesVisible) && (
        <path
          d={pathData}
          fill="none"
          stroke={stitchLineStyles.getLineColor(stitchLine)}
          strokeWidth={stitchLineThickness}
        />
      )}
      {(!isInteractive || settings.view.stitchHolesVisible) && (
        <StitchLineRouteHoles holes={route.holes} stitchLine={stitchLine} />
      )}
      {isInteractive && settings.view.stitchesVisible && <Stitches stitches={route.stitches} stitchLine={stitchLine} />}
      {isInteractive && isStitchLineActive && settings.view.stitchCountVisible && <StitchRouteLabel route={route} />}
      {isInteractive && (
        <path d={pathData} fill="none" pointerEvents="stroke" stroke="transparent" strokeWidth={hitAreaThickness} />
      )}
    </g>
  )
}

const isSameStitchLineRoute = (target: EventTarget | null, stitchLineId: string): boolean => {
  if (!(target instanceof Element)) {
    return false
  }

  return target.closest(`[data-stitch-line-id="${CSS.escape(stitchLineId)}"]`) !== null
}
