import { memo, useMemo, type MouseEvent, type PointerEvent } from 'react'
import { STITCH_HOLE_FOOTPRINT_OPACITY } from '../../constants/drawing'
import type { RectSchema } from '../../schemas/geometry'
import type { SvgDrawingModeSchema } from '../../schemas/svg'
import { isDefined } from '../../utils/isDefined'
import { SelectionShadow, type SelectionShadowPath } from './SelectionShadow'

type PureSvgStitchLineProps = {
  mode: SvgDrawingModeSchema
  stitchLineId: string
  stitchLinePath: string
  stitchHolesPath?: string
  threadPath?: string
  boundingRect: RectSchema
  stitchLineColor: string | undefined
  stitchLineThickness: number | undefined
  stitchHoleColor: string | undefined
  stitchHoleThickness: number | undefined
  threadColor: string | undefined
  threadThickness: number | undefined
  stitchHoleFootprintColor: string | undefined
  stitchHoleFootprintThickness: number | undefined
  selectionColor: string
  stitchLinesVisible: boolean
  stitchHoleFootprintVisible: boolean
  disablePointerEvents?: boolean
  hitAreaThickness?: number
  onClick?: (event: MouseEvent<SVGGElement>) => void
  onPointerEnter?: (event: PointerEvent<SVGGElement>) => void
  onPointerLeave?: (event: PointerEvent<SVGGElement>) => void
}

export const PureSvgStitchLine = memo(function PureSvgStitchLine({
  mode,
  stitchLineId,
  stitchLinePath,
  stitchHolesPath,
  threadPath,
  boundingRect,
  stitchLineColor,
  stitchLineThickness,
  stitchHoleColor,
  stitchHoleThickness,
  threadColor,
  threadThickness,
  stitchHoleFootprintColor,
  stitchHoleFootprintThickness,
  selectionColor,
  stitchLinesVisible,
  stitchHoleFootprintVisible,
  disablePointerEvents = false,
  hitAreaThickness,
  onClick,
  onPointerEnter,
  onPointerLeave,
}: PureSvgStitchLineProps) {
  const shadowPaths = useMemo<SelectionShadowPath[]>(() => {
    const paths: SelectionShadowPath[] = []
    if (stitchLinesVisible) {
      paths.push({ path: stitchLinePath, strokeWidth: stitchLineThickness ?? 1 })
    }
    if (isDefined(stitchHolesPath)) {
      paths.push({ path: stitchHolesPath, strokeWidth: stitchLineThickness ?? 1, strokeLinecap: 'round' })
    }
    if (isDefined(threadPath)) {
      paths.push({ path: threadPath, strokeWidth: stitchLineThickness ?? 1, strokeLinecap: 'round' })
    }
    return paths
  }, [stitchLinesVisible, stitchLinePath, stitchHolesPath, threadPath, stitchLineThickness])
  const isSelected = mode === 'selected'
  const pointerEventsDisabled = disablePointerEvents || isSelected

  return (
    <g
      data-stitch-line-id={stitchLineId}
      fill="none"
      pointerEvents={pointerEventsDisabled ? 'none' : undefined}
      onClick={pointerEventsDisabled ? undefined : onClick}
      onPointerEnter={pointerEventsDisabled ? undefined : onPointerEnter}
      onPointerLeave={pointerEventsDisabled ? undefined : onPointerLeave}
    >
      {mode !== 'hit-area' && (
        <>
          {isSelected && !stitchHoleFootprintVisible && shadowPaths.length > 0 && (
            <SelectionShadow color={selectionColor} paths={shadowPaths} boundingRect={boundingRect} />
          )}
          {stitchHoleFootprintVisible && (
            <path
              d={stitchLinePath}
              strokeLinecap="round"
              strokeLinejoin="round"
              stroke={isSelected ? selectionColor : stitchHoleFootprintColor}
              strokeOpacity={isSelected ? STITCH_HOLE_FOOTPRINT_OPACITY : undefined}
              strokeWidth={stitchHoleFootprintThickness}
            />
          )}
          {stitchLinesVisible && (
            <path
              d={stitchLinePath}
              stroke={isSelected ? selectionColor : stitchLineColor}
              strokeWidth={stitchLineThickness}
            />
          )}
          {isDefined(stitchHolesPath) && (
            <path
              d={stitchHolesPath}
              stroke={isSelected ? selectionColor : stitchHoleColor}
              strokeWidth={stitchHoleThickness}
              strokeLinecap="round"
            />
          )}
          {isDefined(threadPath) && (
            <path d={threadPath} stroke={threadColor} strokeWidth={threadThickness} strokeLinecap="round" />
          )}
        </>
      )}
      {!isSelected && isDefined(hitAreaThickness) && (
        <path
          d={stitchLinePath}
          stroke="transparent"
          strokeWidth={hitAreaThickness}
          pointerEvents={pointerEventsDisabled ? 'none' : 'stroke'}
        />
      )}
    </g>
  )
})
