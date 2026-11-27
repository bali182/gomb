import { useCallback, useMemo, type FC, type MouseEvent } from 'react'
import { useDrawAreaContext } from '../../contexts/DrawAreaContext'
import { useSvgFace } from '../../contexts/SvgFaceContext'
import { useGlobalSettings } from '../../hooks/useGlobalSettings'
import { usePath } from '../../hooks/usePath'
import { useSubProject } from '../../hooks/useSubProject'
import type { PocketClusterSchema } from '../../schemas/components'
import type { DrawAreaComponentBackgroundStyleParams, DrawAreaComponentStyleParams } from '../../schemas/drawArea'
import { Pocket } from './Pocket'
import { PureSvgComponent } from './PureSvgComponent'
import { SelectionPortal } from './SelectionPortal'
import { SizeLabel } from './SizeLabel'

const POCKET_CLUSTER_HIT_AREA_THICKNESS = 2

type PocketClusterProps = {
  componentId: string
  nestingLevel: number
}

export const PocketCluster: FC<PocketClusterProps> = ({ componentId, nestingLevel }) => {
  const { componentStyles, selectionStyles, isInteractive, selection } = useDrawAreaContext()
  const { hover, clearHover, select } = selection
  const { settings } = useGlobalSettings()

  const { accessor, computedAccessor } = useSubProject()
  const computed = computedAccessor.component.pocketCluster(componentId)
  const { direction } = useSvgFace()
  const pocketIds = direction === 'reverse' ? [...computed.children].reverse() : computed.children
  const path = usePath(computed.path)

  const cluster = useMemo<PocketClusterSchema>(
    () => accessor.component.pocketCluster(componentId),
    [accessor.component, componentId],
  )

  const active = selection.isSelected(cluster) || selection.isHovered(cluster)
  const isEmpty = computed.children.length === 0

  const onPointerEnter = useCallback((): void => {
    hover(cluster)
  }, [cluster, hover])

  const onPointerLeave = useCallback((): void => {
    clearHover()
  }, [clearHover])

  const backgroundStyleParams: DrawAreaComponentBackgroundStyleParams = { component: cluster, nestingLevel }
  const style: DrawAreaComponentStyleParams = { component: cluster }

  const onClick = useCallback(
    (event: MouseEvent<SVGPathElement>): void => {
      event.stopPropagation()
      select(cluster)
    },
    [cluster, select],
  )

  return (
    <>
      <g data-component-id={componentId}>
        {(isEmpty ? isInteractive : active) && (
          <>
            <PureSvgComponent
              mode={active ? 'hit-area' : 'normal'}
              componentId={cluster.id}
              path={path}
              boundingRect={computed.boundingRect}
              fillColor={isEmpty ? 'none' : componentStyles.getBackgroundColor(backgroundStyleParams)}
              strokeColor={componentStyles.getBorderColor(style)}
              strokeWidth={componentStyles.getBorderThickness(style)}
              strokeDasharray={componentStyles.getBorderDasharray(style)}
              selectionColor={selectionStyles.getSelectionColor()}
              disablePointerEvents={!isInteractive}
              hitAreaStrokeWidth={isEmpty ? POCKET_CLUSTER_HIT_AREA_THICKNESS : undefined}
              onClick={isInteractive ? onClick : undefined}
              onPointerEnter={isInteractive ? onPointerEnter : undefined}
              onPointerLeave={isInteractive ? onPointerLeave : undefined}
            />
            {active && (
              <SelectionPortal>
                <PureSvgComponent
                  mode="selected"
                  componentId={cluster.id}
                  path={path}
                  boundingRect={computed.boundingRect}
                  fillColor={isEmpty ? 'none' : componentStyles.getBackgroundColor(backgroundStyleParams)}
                  strokeColor={componentStyles.getBorderColor(style)}
                  strokeWidth={componentStyles.getBorderThickness(style)}
                  strokeDasharray={componentStyles.getBorderDasharray(style)}
                  selectionColor={selectionStyles.getSelectionColor()}
                />
              </SelectionPortal>
            )}
          </>
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
