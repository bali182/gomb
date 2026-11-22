import { useCallback, useMemo, type FC, type MouseEvent } from 'react'
import { useDrawAreaContext } from '../../contexts/DrawAreaContext'
import { useSvgFace } from '../../contexts/SvgFaceContext'
import { useGlobalSettings } from '../../hooks/useGlobalSettings'
import { usePath } from '../../hooks/usePath'
import { useSubProject } from '../../hooks/useSubProject'
import type { DrawAreaComponentStyleParams } from '../../schemas/drawArea'
import { Pocket } from './Pocket'
import { SizeLabel } from './SizeLabel'

const POCKET_CLUSTER_HIT_AREA_THICKNESS = 2

type PocketClusterProps = {
  componentId: string
  nestingLevel: number
}

export const PocketCluster: FC<PocketClusterProps> = ({ componentId, nestingLevel }) => {
  const { componentStyles, isInteractive, selection } = useDrawAreaContext()
  const { settings } = useGlobalSettings()

  const { accessor, computedAccessor } = useSubProject()
  const computed = computedAccessor.component.pocketCluster(componentId)
  const { direction } = useSvgFace()
  const pocketIds = direction === 'reverse' ? [...computed.children].reverse() : computed.children
  const pathData = usePath(computed.path)

  const cluster = useMemo(() => accessor.component.pocketCluster(componentId), [accessor.component, componentId])

  const active = selection.isSelected(cluster) || selection.isHovered(cluster)
  const isEmpty = computed.children.length === 0

  const onPointerEnter = useCallback((): void => {
    selection.hover(cluster)
  }, [cluster, selection])

  const onPointerLeave = useCallback((): void => {
    selection.clearHover()
  }, [selection])

  const style: DrawAreaComponentStyleParams = { component: cluster, nestingLevel }

  const onClick = useCallback(
    (event: MouseEvent): void => {
      event.stopPropagation()
      selection.select(cluster)
    },
    [cluster, selection],
  )

  return (
    <>
      <g data-component-id={componentId} onClick={isInteractive && !isEmpty ? onClick : undefined}>
        {(isEmpty ? isInteractive : active) && (
          <path
            d={pathData}
            fill={isEmpty ? 'none' : componentStyles.getBackgroundColor(style)}
            stroke={componentStyles.getBorderColor(style)}
            strokeWidth={componentStyles.getBorderThickness(style)}
            strokeDasharray={componentStyles.getBorderDasharray(style)}
            filter={componentStyles.getFilter(style)}
            pointerEvents={isEmpty ? 'none' : undefined}
            onPointerEnter={isInteractive && !isEmpty ? onPointerEnter : undefined}
            onPointerLeave={isInteractive && !isEmpty ? onPointerLeave : undefined}
          />
        )}
        {isInteractive && isEmpty && (
          <path
            d={pathData}
            fill="none"
            stroke="transparent"
            strokeWidth={POCKET_CLUSTER_HIT_AREA_THICKNESS}
            pointerEvents="stroke"
            onClick={onClick}
            onPointerEnter={onPointerEnter}
            onPointerLeave={onPointerLeave}
          />
        )}
        {pocketIds.map((pocketId) => (
          <Pocket key={pocketId} componentId={pocketId} nestingLevel={nestingLevel} />
        ))}
      </g>
      {settings.view.componentDimensionsVisible && active && (
        <SizeLabel reference="bottom-right" boundingRect={computed.boundingRect} />
      )}
    </>
  )
}
