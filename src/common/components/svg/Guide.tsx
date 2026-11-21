import { useCallback, type FC, type MouseEvent, type PointerEvent } from 'react'
import { useDrawAreaContext } from '../../contexts/DrawAreaContext'
import { useSvgFace } from '../../contexts/SvgFaceContext'
import { useComponent } from '../../hooks/useComponent'
import { useComputedComponent } from '../../hooks/useComputedComponent'
import { useGlobalSettings } from '../../hooks/useGlobalSettings'
import { usePath } from '../../hooks/usePath'
import { useSubProject } from '../../hooks/useSubProject'
import type { GuideSchema } from '../../schemas/components'
import type { ComputedGuideSchema } from '../../schemas/computed'
import { accessors } from '../../utils/accessors'
import { Panel } from './Panel'
import { PocketCluster } from './PocketCluster'
import { SizeLabel } from './SizeLabel'

const GUIDE_HIT_AREA_THICKNESS = 2

type GuideProps = { componentId: string; nestingLevel: number }

export const Guide: FC<GuideProps> = ({ componentId, nestingLevel }) => {
  const { isInteractive, selection, componentStyles } = useDrawAreaContext()
  const { settings } = useGlobalSettings()
  const guide = useComponent<GuideSchema>(componentId)
  const computed = useComputedComponent<ComputedGuideSchema>(componentId)
  const { computedSubProject } = useSubProject()
  const { direction } = useSvgFace()
  const children = accessors.computedSubProject(computedSubProject).component.children(componentId)
  const orderedChildren = direction === 'reverse' ? [...children].reverse() : children
  const pathData = usePath(computed.path)
  const isEmpty = children.length === 0
  const isActive = selection.isSelected(guide) || selection.isHovered(guide)
  const isSelectable = isInteractive && isEmpty
  const style = { component: guide, nestingLevel }
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
            d={pathData}
            fill="none"
            stroke="transparent"
            strokeWidth={GUIDE_HIT_AREA_THICKNESS}
            pointerEvents="stroke"
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
          <path
            d={pathData}
            fill="none"
            stroke={componentStyles.getBorderColor(style)}
            strokeWidth={componentStyles.getBorderThickness(style)}
            strokeDasharray={componentStyles.getBorderDasharray(style)}
            filter={componentStyles.getFilter(style)}
            pointerEvents="none"
          />
        )}
      </g>
      {isInteractive && isActive && settings.view.componentDimensionsVisible && (
        <SizeLabel reference="bottom-right" boundingRect={computed.boundingRect} />
      )}
    </>
  )
}
