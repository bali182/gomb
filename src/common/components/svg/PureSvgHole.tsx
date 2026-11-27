import { memo, useMemo, type MouseEvent, type PointerEvent, type SVGAttributes } from 'react'
import type { RectSchema } from '../../schemas/geometry'
import type { SvgDrawingModeSchema } from '../../schemas/svg'
import { isDefined } from '../../utils/isDefined'
import { SelectionShadow, type SelectionShadowPath } from './SelectionShadow'

type PureSvgHoleProps = {
  mode: SvgDrawingModeSchema
  holeId: string
  path: string
  boundingRect: RectSchema
  fillColor: string | undefined
  strokeColor: string | undefined
  strokeWidth: number | undefined
  selectionColor: string
  disablePointerEvents?: boolean
  cursor?: SVGAttributes<SVGPathElement>['cursor']
  onClick?: (event: MouseEvent<SVGPathElement>) => void
  onPointerEnter?: (event: PointerEvent<SVGPathElement>) => void
  onPointerLeave?: (event: PointerEvent<SVGPathElement>) => void
}

export const PureSvgHole = memo(function PureSvgHole({
  mode,
  holeId,
  path,
  boundingRect,
  fillColor,
  strokeColor,
  strokeWidth,
  selectionColor,
  disablePointerEvents = false,
  cursor,
  onClick,
  onPointerEnter,
  onPointerLeave,
}: PureSvgHoleProps) {
  const shadowPaths = useMemo<SelectionShadowPath[]>(
    () => [{ path, strokeWidth: strokeWidth ?? 1 }],
    [path, strokeWidth],
  )
  const isSelected = mode === 'selected'
  const pointerEventsDisabled = disablePointerEvents || isSelected
  const isHitArea = mode === 'hit-area'
  const maskInside = isDefined(fillColor) && fillColor !== 'none' && fillColor !== 'transparent'

  return (
    <>
      {isSelected && (
        <SelectionShadow
          color={selectionColor}
          paths={shadowPaths}
          boundingRect={boundingRect}
          maskInside={maskInside}
        />
      )}
      <path
        d={path}
        data-hole-id={holeId}
        fill={isSelected ? 'none' : fillColor}
        stroke={isHitArea ? 'transparent' : isSelected ? selectionColor : strokeColor}
        strokeWidth={strokeWidth}
        pointerEvents={pointerEventsDisabled ? 'none' : 'fill'}
        cursor={pointerEventsDisabled ? undefined : cursor}
        onClick={pointerEventsDisabled ? undefined : onClick}
        onPointerEnter={pointerEventsDisabled ? undefined : onPointerEnter}
        onPointerLeave={pointerEventsDisabled ? undefined : onPointerLeave}
      />
    </>
  )
})
