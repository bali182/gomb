import type BigNumber from 'bignumber.js'
import { useCallback, useMemo, type FC, type MouseEventHandler, type PointerEventHandler } from 'react'

import { POCKET_ITEM_STITCH_MASK_ID, POCKET_ITEM_STITCH_MASK_REVERSE_ID } from '../../constants/drawing'
import { useDrawAreaContext } from '../../contexts/DrawAreaContext'
import { useSvgFace } from '../../contexts/SvgFaceContext'
import { useGlobalSettings } from '../../hooks/useGlobalSettings'
import { usePath } from '../../hooks/usePath'
import { useSubProject } from '../../hooks/useSubProject'
import { reflectRectHorizontally } from '../../logic/geometryUtils'
import { getSvgLinePathData } from '../../logic/getSvgPathData'
import type { ComputedStitchRouteSchema } from '../../schemas/computed'
import type { RectSchema } from '../../schemas/geometry'
import type { ResolvedStitchLineSchema } from '../../schemas/stitching'
import { isDefined } from '../../utils/isDefined'
import { SelectionShadow, type SelectionShadowPath } from './SelectionShadow'
import { StitchRouteLabel } from './StitchRouteLabel'

type StitchLineRouteProps = {
  route: ComputedStitchRouteSchema
  stitchLine: ResolvedStitchLineSchema
}

export const StitchLineRoute: FC<StitchLineRouteProps> = ({ route, stitchLine }) => {
  const { isInteractive, isShowingPocketItems, selection, stitchLineStyles } = useDrawAreaContext()
  const { settings } = useGlobalSettings()
  const { direction, faceId } = useSvgFace()
  const { computedAccessor } = useSubProject()
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
      mask={isShowingPocketItems && !isStitchLineActive ? `url(#${maskId})` : undefined}
      data-stitch-line-id={stitchLine.id}
      onClick={isInteractive ? handleClick : undefined}
      onPointerEnter={isInteractive ? handlePointerEnter : undefined}
      onPointerLeave={isInteractive ? handlePointerLeave : undefined}
    >
      {isStitchLineActive && (
        <StitchLineRouteSelectionShadow
          model={stitchLine}
          computedModel={route}
          stitchLinePath={stitchLinePath}
          stitchHolesPath={stitchHolesPath}
          threadPath={threadPath}
          reflectionAxisX={reflectionAxisX}
        />
      )}
      {settings.view.stitchHoleFootprintVisible && (
        <path
          d={stitchLinePath}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          stroke={stitchLineStyles.getStitchHoleFootprintColor(stitchLine)}
          strokeWidth={stitchLineStyles.getStitchHoleFootprintThickness(stitchLine)}
        />
      )}
      {settings.view.stitchLinesVisible && (
        <path
          d={stitchLinePath}
          fill="none"
          stroke={stitchLineStyles.getLineColor(stitchLine)}
          strokeWidth={stitchLineThickness}
        />
      )}
      {isDefined(stitchHolesPath) && (
        <path
          d={stitchHolesPath}
          fill="none"
          strokeLinecap="round"
          stroke={stitchLineStyles.getStitchHoleColor(stitchLine)}
          strokeWidth={stitchHoleThickness}
        />
      )}
      {isDefined(threadPath) && (
        <path
          d={threadPath}
          fill="none"
          stroke={stitchLineStyles.getThreadColor(stitchLine)}
          strokeLinecap="round"
          strokeWidth={stitchLineStyles.getThreadThickness(stitchLine)}
        />
      )}
      {isStitchLineActive && settings.view.stitchCountVisible && (
        <StitchRouteLabel route={route} reflectionAxisX={reflectionAxisX} />
      )}
      {isInteractive && (
        <path
          d={stitchLinePath}
          fill="none"
          pointerEvents="stroke"
          stroke="transparent"
          strokeWidth={hitAreaThickness}
        />
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

type StitchLineRouteSelectionShadowProps = {
  model: ResolvedStitchLineSchema
  computedModel: ComputedStitchRouteSchema
  stitchLinePath: string
  stitchHolesPath?: string
  threadPath?: string
  reflectionAxisX?: BigNumber
}

const StitchLineRouteSelectionShadow: FC<StitchLineRouteSelectionShadowProps> = ({
  model: stitchLine,
  computedModel: route,
  stitchLinePath,
  stitchHolesPath,
  threadPath,
  reflectionAxisX,
}) => {
  const { selectionStyles, stitchLineStyles } = useDrawAreaContext()
  const { settings } = useGlobalSettings()
  const stitchLineThickness = stitchLineStyles.getLineThickness(stitchLine)
  const stitchHoleThickness = stitchLineStyles.getStitchHoleThickness(stitchLine)
  const threadThickness = stitchLineStyles.getThreadThickness(stitchLine)

  const shadowPaths = useMemo<SelectionShadowPath[]>(() => {
    const paths: SelectionShadowPath[] = []
    if (settings.view.stitchLinesVisible) {
      paths.push({ path: stitchLinePath, strokeWidth: stitchLineThickness ?? 1 })
    }
    if (isDefined(stitchHolesPath)) {
      paths.push({
        path: stitchHolesPath,
        strokeWidth: stitchLineThickness ?? 1,
        strokeLinecap: 'round',
      })
    }
    if (isDefined(threadPath)) {
      paths.push({
        path: threadPath,
        strokeWidth: stitchLineThickness ?? 1,
        strokeLinecap: 'round',
      })
    }
    return paths
  }, [settings.view.stitchLinesVisible, stitchLinePath, stitchHolesPath, threadPath, stitchLineThickness])

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

  if (shadowPaths.length === 0) {
    return null
  }

  return (
    <SelectionShadow
      paths={shadowPaths}
      boundingRect={shadowBoundingRect}
      color={selectionStyles.getSelectionColor()}
    />
  )
}

type StitchLineRoutePaths = {
  stitchLinePath: string
  stitchHolesPath?: string
  threadPath?: string
}

const useStitchLineRoutePaths = (
  route: ComputedStitchRouteSchema,
  reflectionAxisX?: BigNumber,
): StitchLineRoutePaths => {
  const { settings } = useGlobalSettings()
  const stitchLinePath = usePath(route.path, reflectionAxisX)

  const stitchHolesPath = useMemo<string | undefined>(() => {
    if (!settings.view.stitchHolesVisible || route.holes.length === 0) {
      return undefined
    }
    return route.holes.map(({ line }) => getSvgLinePathData(line, reflectionAxisX)).join(' ')
  }, [route.holes, reflectionAxisX, settings.view.stitchHolesVisible])

  const threadPath = useMemo<string | undefined>(() => {
    if (!settings.view.stitchesVisible || route.stitches.length === 0) {
      return undefined
    }
    return route.stitches.map(({ line }) => getSvgLinePathData(line, reflectionAxisX)).join(' ')
  }, [route.stitches, reflectionAxisX, settings.view.stitchesVisible])

  return { stitchLinePath, stitchHolesPath, threadPath }
}
