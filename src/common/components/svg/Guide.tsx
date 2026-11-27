import { useCallback, useMemo, type FC, type MouseEvent, type PointerEvent } from 'react'
import { useDrawAreaContext } from '../../contexts/DrawAreaContext'
import { useSvgFace } from '../../contexts/SvgFaceContext'
import { useGlobalSettings } from '../../hooks/useGlobalSettings'
import { usePath } from '../../hooks/usePath'
import { useSubProject } from '../../hooks/useSubProject'
import type { GuideSchema } from '../../schemas/components'
import type { ComputedGuideSchema } from '../../schemas/computed'
import type { DrawAreaComponentStyleParams } from '../../schemas/drawArea'
import { Panel } from './Panel'
import { PocketCluster } from './PocketCluster'
import { SelectionShadow, type SelectionShadowPath } from './SelectionShadow'
import { SizeLabel } from './SizeLabel'

const GUIDE_HIT_AREA_THICKNESS = 2

type GuideProps = { componentId: string; nestingLevel: number }

export const Guide: FC<GuideProps> = ({ componentId, nestingLevel }) => {
  const { isInteractive, selection, componentStyles } = useDrawAreaContext()
  const { settings } = useGlobalSettings()
  const { accessor, computedAccessor } = useSubProject()
  const computed = computedAccessor.component.guide(componentId)
  const { direction } = useSvgFace()
  const children = computedAccessor.component.children(componentId)
  const orderedChildren = direction === 'reverse' ? [...children].reverse() : children
  const path = usePath(computed.path)
  const isEmpty = children.length === 0

  const guide = useMemo(() => accessor.component.guide(componentId), [accessor.component, componentId])

  const isActive = selection.isSelected(guide) || selection.isHovered(guide)
  const isSelectable = isInteractive && isEmpty
  const style: DrawAreaComponentStyleParams = { component: guide }

  const handleClick = useCallback(
    (event: MouseEvent<SVGPathElement>): void => {
      event.stopPropagation()
      selection.select(guide)
    },
    [guide, selection],
  )

  const handlePointerEnter = useCallback(
    (_event: PointerEvent<SVGPathElement>): void => {
      selection.hover(guide)
    },
    [guide, selection],
  )
  const handlePointerLeave = useCallback(
    (_event: PointerEvent<SVGPathElement>): void => {
      selection.clearHover()
    },
    [selection],
  )
  return (
    <>
      <g data-component-id={componentId}>
        {isSelectable && (
          <path
            d={path}
            fill="transparent"
            stroke="transparent"
            strokeWidth={GUIDE_HIT_AREA_THICKNESS}
            pointerEvents="all"
            onClick={handleClick}
            onPointerEnter={handlePointerEnter}
            onPointerLeave={handlePointerLeave}
          />
        )}
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
            {isActive && <GuideSelectionShadow model={guide} computedModel={computed} path={path} />}
            <path
              d={path}
              fill="none"
              stroke={componentStyles.getBorderColor(style)}
              strokeWidth={componentStyles.getBorderThickness(style)}
              strokeDasharray={componentStyles.getBorderDasharray(style)}
              pointerEvents="none"
            />
          </>
        )}
      </g>
      {isInteractive && isActive && settings.view.componentDimensionsVisible && (
        <SizeLabel reference="bottom-right" boundingRect={computed.boundingRect} />
      )}
    </>
  )
}

type GuideSelectionShadowProps = {
  model: GuideSchema
  computedModel: ComputedGuideSchema
  path: string
}

const GuideSelectionShadow: FC<GuideSelectionShadowProps> = ({ model, computedModel, path }) => {
  const { componentStyles, selectionStyles } = useDrawAreaContext()
  const paths = useMemo<SelectionShadowPath[]>(() => {
    const params: DrawAreaComponentStyleParams = { component: model }
    return [
      {
        path,
        strokeWidth: componentStyles.getBorderThickness(params) ?? 1,
        strokeDasharray: componentStyles.getBorderDasharray(params),
      },
    ]
  }, [path, componentStyles, model])

  return (
    <SelectionShadow
      paths={paths}
      boundingRect={computedModel.boundingRect}
      color={selectionStyles.getSelectionColor()}
    />
  )
}
