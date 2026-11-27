import { memo, useMemo, type MouseEvent, type PointerEvent } from 'react'
import type { RectSchema } from '../../schemas/geometry'
import type { SvgDrawingModeSchema } from '../../schemas/svg'
import { isDefined } from '../../utils/isDefined'
import { SelectionShadow, type SelectionShadowPath } from './SelectionShadow'

type PureSvgComponentProps = {
  mode: SvgDrawingModeSchema
  componentId: string
  path: string
  boundingRect: RectSchema
  fillColor: string | undefined
  strokeColor: string | undefined
  strokeWidth: number | undefined
  strokeDasharray?: string
  selectionColor: string
  disablePointerEvents?: boolean
  hitAreaStrokeWidth?: number
  onClick?: (event: MouseEvent<SVGPathElement>) => void
  onPointerEnter?: (event: PointerEvent<SVGPathElement>) => void
  onPointerLeave?: (event: PointerEvent<SVGPathElement>) => void
}

export const PureSvgComponent = memo(function PureSvgComponent({
  mode,
  componentId,
  path,
  boundingRect,
  fillColor,
  strokeColor,
  strokeWidth,
  strokeDasharray,
  selectionColor,
  disablePointerEvents = false,
  hitAreaStrokeWidth,
  onClick,
  onPointerEnter,
  onPointerLeave,
}: PureSvgComponentProps) {
  const shadowPaths = useMemo<SelectionShadowPath[]>(
    () => [{ path, strokeWidth: strokeWidth ?? 1, strokeDasharray }],
    [path, strokeWidth, strokeDasharray],
  )
  const isSelected = mode === 'selected'
  const pointerEventsDisabled = disablePointerEvents || isSelected
  const isHitArea = mode === 'hit-area'
  const hasSeparateHitArea = mode !== 'selected' && isDefined(hitAreaStrokeWidth)
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
        data-component-id={componentId}
        fill={isSelected ? 'none' : fillColor}
        stroke={isHitArea ? 'transparent' : isSelected ? selectionColor : strokeColor}
        strokeWidth={isHitArea ? (hitAreaStrokeWidth ?? strokeWidth) : strokeWidth}
        strokeDasharray={isHitArea ? undefined : strokeDasharray}
        pointerEvents={pointerEventsDisabled || hasSeparateHitArea ? 'none' : 'visiblePainted'}
        onClick={pointerEventsDisabled || hasSeparateHitArea ? undefined : onClick}
        onPointerEnter={pointerEventsDisabled || hasSeparateHitArea ? undefined : onPointerEnter}
        onPointerLeave={pointerEventsDisabled || hasSeparateHitArea ? undefined : onPointerLeave}
      />
      {hasSeparateHitArea && (
        <path
          d={path}
          data-component-id={componentId}
          fill="transparent"
          stroke="transparent"
          strokeWidth={hitAreaStrokeWidth}
          pointerEvents={pointerEventsDisabled ? 'none' : 'all'}
          onClick={pointerEventsDisabled ? undefined : onClick}
          onPointerEnter={pointerEventsDisabled ? undefined : onPointerEnter}
          onPointerLeave={pointerEventsDisabled ? undefined : onPointerLeave}
        />
      )}
    </>
  )
})
