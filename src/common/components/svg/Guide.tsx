import { useCallback, useMemo, type FC, type MouseEvent, type PointerEvent } from 'react'
import { useDrawAreaContext } from '../../contexts/DrawAreaContext'
import { useSvgFace } from '../../contexts/SvgFaceContext'
import { useGlobalSettings } from '../../hooks/useGlobalSettings'
import { usePath } from '../../hooks/usePath'
import { useSubProject } from '../../hooks/useSubProject'
import type { GuideSchema } from '../../schemas/components'
import type { DrawAreaComponentStyleParams } from '../../schemas/drawArea'
import { Panel } from './Panel'
import { PocketCluster } from './PocketCluster'
import { PureSvgComponent } from './PureSvgComponent'
import { SelectionPortal } from './SelectionPortal'
import { SizeLabel } from './SizeLabel'

const GUIDE_HIT_AREA_THICKNESS = 2

type GuideProps = { componentId: string; nestingLevel: number }

export const Guide: FC<GuideProps> = ({ componentId, nestingLevel }) => {
  const { isInteractive, selection, componentStyles, selectionStyles } = useDrawAreaContext()
  const { hover, clearHover, select } = selection
  const { settings } = useGlobalSettings()
  const { accessor, computedAccessor } = useSubProject()
  const computed = computedAccessor.component.guide(componentId)
  const { direction } = useSvgFace()
  const children = computedAccessor.component.children(componentId)
  const orderedChildren = direction === 'reverse' ? [...children].reverse() : children
  const path = usePath(computed.path)
  const isEmpty = children.length === 0 && accessor.stitchLine.byOwner(componentId).length === 0

  const guide = useMemo<GuideSchema>(() => accessor.component.guide(componentId), [accessor.component, componentId])

  const isActive = selection.isSelected(guide) || selection.isHovered(guide)
  const isSelectable = isInteractive && isEmpty
  const style: DrawAreaComponentStyleParams = { component: guide }

  const handleClick = useCallback(
    (event: MouseEvent<SVGPathElement>): void => {
      event.stopPropagation()
      select(guide)
    },
    [guide, select],
  )

  const handlePointerEnter = useCallback(
    (_event: PointerEvent<SVGPathElement>): void => {
      hover(guide)
    },
    [guide, hover],
  )
  const handlePointerLeave = useCallback(
    (_event: PointerEvent<SVGPathElement>): void => {
      clearHover()
    },
    [clearHover],
  )
  return (
    <>
      <g data-component-id={componentId}>
        {orderedChildren.map((child) => {
          switch (child.type) {
            case 'computed-panel':
              return <Panel key={child.componentId} componentId={child.componentId} nestingLevel={nestingLevel} />
            case 'computed-pocket-cluster':
              return (
                <PocketCluster key={child.componentId} componentId={child.componentId} nestingLevel={nestingLevel} />
              )
            case 'computed-guide':
            case 'computed-root-panel':
            case 'computed-root-panel-face':
            case 'computed-front-pocket':
            case 'computed-t-pocket':
              throw new Error(`Unsupported Guide child: ${child.type}`)
          }
        })}
        {isInteractive && (isEmpty || isActive) && (
          <>
            <PureSvgComponent
              mode={isActive ? 'hit-area' : 'normal'}
              componentId={guide.id}
              path={path}
              boundingRect={computed.boundingRect}
              fillColor="none"
              strokeColor={componentStyles.getBorderColor(style)}
              strokeWidth={componentStyles.getBorderThickness(style)}
              strokeDasharray={componentStyles.getBorderDasharray(style)}
              selectionColor={selectionStyles.getSelectionColor()}
              disablePointerEvents={!isSelectable}
              hitAreaStrokeWidth={isEmpty ? GUIDE_HIT_AREA_THICKNESS : undefined}
              onClick={isSelectable ? handleClick : undefined}
              onPointerEnter={isSelectable ? handlePointerEnter : undefined}
              onPointerLeave={isSelectable ? handlePointerLeave : undefined}
            />
            {isActive && (
              <SelectionPortal>
                <PureSvgComponent
                  mode="selected"
                  componentId={guide.id}
                  path={path}
                  boundingRect={computed.boundingRect}
                  fillColor="none"
                  strokeColor={componentStyles.getBorderColor(style)}
                  strokeWidth={componentStyles.getBorderThickness(style)}
                  strokeDasharray={componentStyles.getBorderDasharray(style)}
                  selectionColor={selectionStyles.getSelectionColor()}
                />
              </SelectionPortal>
            )}
          </>
        )}
      </g>
      {isInteractive && isActive && settings.view.componentDimensionsVisible && (
        <SizeLabel reference="bottom-right" boundingRect={computed.boundingRect} />
      )}
    </>
  )
}
