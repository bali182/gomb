import type BigNumber from 'bignumber.js'
import { useCallback, useMemo, type FC, type MouseEvent, type PointerEvent } from 'react'

import { POCKET_ITEM_STITCH_MASK_ID, POCKET_ITEM_STITCH_MASK_REVERSE_ID } from '../../constants/drawing'
import { useDrawAreaContext } from '../../contexts/DrawAreaContext'
import { useSvgFace } from '../../contexts/SvgFaceContext'
import { useGlobalSettings } from '../../hooks/useGlobalSettings'
import { useStitchLineRoutePaths } from '../../hooks/useStitchLineRoutePaths'
import { useSubProject } from '../../hooks/useSubProject'
import { reflectRectHorizontally } from '../../logic/geometryUtils'
import type { ComputedStitchRouteSchema } from '../../schemas/computed'
import type { RectSchema } from '../../schemas/geometry'
import type { ResolvedStitchLineSchema } from '../../schemas/stitching'
import { isDefined } from '../../utils/isDefined'
import { PureSvgStitchLine } from './PureSvgStitchLine'
import { SelectionPortal } from './SelectionPortal'
import { StitchRouteLabel } from './StitchRouteLabel'

type StitchLineRouteProps = {
  route: ComputedStitchRouteSchema
  stitchLine: ResolvedStitchLineSchema
  portalSelection: boolean
}

export const StitchLineRoute: FC<StitchLineRouteProps> = ({ route, stitchLine, portalSelection }) => {
  const { isInteractive, isShowingPocketItems, selection, selectionStyles, stitchLineStyles } = useDrawAreaContext()
  const { hover, clearHover, select } = selection
  const { settings } = useGlobalSettings()
  const { direction, faceId } = useSvgFace()
  const { accessor, computedAccessor } = useSubProject()
  const reflectionAxisX = useMemo<BigNumber | undefined>(() => {
    if (route.faceId === faceId) {
      return undefined
    }
    const root = computedAccessor.component.rootPanel()
    return root.boundingRect.x.plus(root.boundingRect.width.dividedBy(2))
  }, [route.faceId, faceId, computedAccessor])
  const maskId = direction === 'reverse' ? POCKET_ITEM_STITCH_MASK_REVERSE_ID : POCKET_ITEM_STITCH_MASK_ID
  const { stitchLinePath, stitchHolesPath, threadPath } = useStitchLineRoutePaths(route, reflectionAxisX)
  const stitchLineThickness = stitchLineStyles.getLineThickness(stitchLine)
  const stitchHoleThickness = stitchLineStyles.getStitchHoleThickness(stitchLine)
  const threadThickness = stitchLineStyles.getThreadThickness(stitchLine)
  const shadowBoundingRect = useMemo<RectSchema>(() => {
    const padding =
      Math.max(
        stitchLineThickness ?? 1,
        stitchLine.stitchHoleLength + Math.max(stitchHoleThickness ?? 1, threadThickness ?? 1),
      ) / 2
    const boundingRect: RectSchema = {
      x: route.boundingRect.x.minus(padding),
      y: route.boundingRect.y.minus(padding),
      width: route.boundingRect.width.plus(padding * 2),
      height: route.boundingRect.height.plus(padding * 2),
    }
    return isDefined(reflectionAxisX) ? reflectRectHorizontally(boundingRect, reflectionAxisX) : boundingRect
  }, [
    route.boundingRect,
    stitchLine.stitchHoleLength,
    stitchLineThickness,
    stitchHoleThickness,
    threadThickness,
    reflectionAxisX,
  ])

  const isStitchLineActive = selection.isSelected(stitchLine) || selection.isHovered(stitchLine)
  const hitAreaThickness =
    1 + Math.max(stitchLineThickness ?? 0, stitchLine.stitchHoleLength / Math.SQRT2 + (stitchHoleThickness ?? 0))

  const handlePointerEnter = useCallback((): void => {
    hover(accessor.stitchLine.byId(stitchLine.id))
  }, [hover, accessor, stitchLine.id])

  const handlePointerLeave = useCallback(
    (event: PointerEvent<SVGGElement>): void => {
      if (isSameStitchLineRoute(event.relatedTarget, stitchLine.id)) {
        return
      }
      clearHover()
    },
    [clearHover, stitchLine.id],
  )

  const handleClick = useCallback(
    (event: MouseEvent<SVGGElement>): void => {
      event.stopPropagation()
      select(accessor.stitchLine.byId(stitchLine.id))
    },
    [select, accessor, stitchLine.id],
  )

  return (
    <g mask={isShowingPocketItems && !isStitchLineActive ? `url(#${maskId})` : undefined}>
      <PureSvgStitchLine
        mode={isStitchLineActive ? 'hit-area' : 'normal'}
        stitchLineId={stitchLine.id}
        stitchLinePath={stitchLinePath}
        stitchHolesPath={stitchHolesPath}
        threadPath={threadPath}
        boundingRect={shadowBoundingRect}
        stitchLineColor={stitchLineStyles.getLineColor(stitchLine)}
        stitchLineThickness={stitchLineThickness}
        stitchHoleColor={stitchLineStyles.getStitchHoleColor(stitchLine)}
        stitchHoleThickness={stitchHoleThickness}
        threadColor={stitchLineStyles.getThreadColor(stitchLine)}
        threadThickness={threadThickness}
        stitchHoleFootprintColor={stitchLineStyles.getStitchHoleFootprintColor(stitchLine)}
        stitchHoleFootprintThickness={stitchLineStyles.getStitchHoleFootprintThickness(stitchLine)}
        selectionColor={selectionStyles.getSelectionColor()}
        stitchLinesVisible={settings.view.stitchLinesVisible}
        stitchHoleFootprintVisible={settings.view.stitchHoleFootprintVisible}
        disablePointerEvents={!isInteractive}
        hitAreaThickness={hitAreaThickness}
        onClick={isInteractive ? handleClick : undefined}
        onPointerEnter={isInteractive ? handlePointerEnter : undefined}
        onPointerLeave={isInteractive ? handlePointerLeave : undefined}
      />
      {isStitchLineActive && portalSelection && (
        <SelectionPortal>
          <PureSvgStitchLine
            mode="selected"
            stitchLineId={stitchLine.id}
            stitchLinePath={stitchLinePath}
            stitchHolesPath={stitchHolesPath}
            threadPath={threadPath}
            boundingRect={shadowBoundingRect}
            stitchLineColor={stitchLineStyles.getLineColor(stitchLine)}
            stitchLineThickness={stitchLineThickness}
            stitchHoleColor={stitchLineStyles.getStitchHoleColor(stitchLine)}
            stitchHoleThickness={stitchHoleThickness}
            threadColor={stitchLineStyles.getThreadColor(stitchLine)}
            threadThickness={threadThickness}
            stitchHoleFootprintColor={stitchLineStyles.getStitchHoleFootprintColor(stitchLine)}
            stitchHoleFootprintThickness={stitchLineStyles.getStitchHoleFootprintThickness(stitchLine)}
            selectionColor={selectionStyles.getSelectionColor()}
            stitchLinesVisible={settings.view.stitchLinesVisible}
            stitchHoleFootprintVisible={settings.view.stitchHoleFootprintVisible}
          />
        </SelectionPortal>
      )}
      {isStitchLineActive && settings.view.stitchCountVisible && (
        <StitchRouteLabel route={route} reflectionAxisX={reflectionAxisX} />
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
