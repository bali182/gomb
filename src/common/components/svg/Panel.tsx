import { useCallback, useMemo, type FC, type MouseEventHandler, type PointerEventHandler } from 'react'
import { Guide } from './Guide'

import { useDrawAreaContext } from '../../contexts/DrawAreaContext'
import { useSvgFace } from '../../contexts/SvgFaceContext'
import { useGlobalSettings } from '../../hooks/useGlobalSettings'
import { usePath } from '../../hooks/usePath'
import { useSubProject } from '../../hooks/useSubProject'
import type { DrawAreaComponentStyleParams } from '../../schemas/drawArea'
import { HoleHighlights } from './HoleHighlights'
import { PocketCluster } from './PocketCluster'
import { SizeLabel } from './SizeLabel'
import { StitchLines } from './StitchLines'
import { SvgComponentLayers } from './SvgComponentLayers'

type PanelProps = {
  componentId: string
  nestingLevel: number
}

export const Panel: FC<PanelProps> = ({ componentId, nestingLevel }) => {
  const { componentStyles, isInteractive, selection } = useDrawAreaContext()
  const { settings } = useGlobalSettings()
  const { accessor, computedAccessor } = useSubProject()
  const computedPanel = computedAccessor.component.panel(componentId)
  const { direction } = useSvgFace()
  const children = computedAccessor.component.children(componentId)
  const orderedChildren = direction === 'reverse' ? [...children].reverse() : children
  const pathData = usePath(computedPanel.path)

  const panel = useMemo(() => accessor.component.panel(componentId), [accessor.component, componentId])

  const isActive = selection.isSelected(panel) || selection.isHovered(panel)
  const styleParams: DrawAreaComponentStyleParams = {
    component: panel,
    nestingLevel,
  }

  const handlePointerEnter = useCallback<PointerEventHandler<SVGPathElement>>(() => {
    selection.hover(panel)
  }, [panel, selection])

  const handlePointerLeave = useCallback<PointerEventHandler<SVGPathElement>>(() => {
    selection.clearHover()
  }, [selection])

  const handleClick = useCallback<MouseEventHandler<SVGPathElement>>(
    (event) => {
      event.stopPropagation()
      selection.select(panel)
    },
    [panel, selection],
  )

  return (
    <>
      <SvgComponentLayers
        content={
          <SvgComponentLayers
            before={<StitchLines componentId={panel.id} surface="back" />}
            after={<StitchLines componentId={panel.id} surface="front" />}
            content={
              <>
                <path
                  d={pathData}
                  fill={componentStyles.getBackgroundColor(styleParams)}
                  filter={componentStyles.getFilter(styleParams)}
                  stroke={componentStyles.getBorderColor(styleParams)}
                  strokeWidth={componentStyles.getBorderThickness(styleParams)}
                  data-component-id={panel.id}
                  onPointerEnter={isInteractive ? handlePointerEnter : undefined}
                  onPointerLeave={isInteractive ? handlePointerLeave : undefined}
                  onClick={isInteractive ? handleClick : undefined}
                />
                <HoleHighlights componentId={panel.id} />
              </>
            }
          />
        }
        after={orderedChildren.map((component) => {
          switch (component.type) {
            case 'computed-guide':
              return (
                <Guide
                  key={component.componentId}
                  componentId={component.componentId}
                  nestingLevel={nestingLevel + 1}
                />
              )
            case 'computed-panel':
              return (
                <Panel
                  componentId={component.componentId}
                  key={component.componentId}
                  nestingLevel={nestingLevel + 1}
                />
              )
            case 'computed-pocket-cluster':
              return (
                <PocketCluster
                  componentId={component.componentId}
                  key={component.componentId}
                  nestingLevel={nestingLevel + 1}
                />
              )
            case 'computed-root-panel':
              throw new Error(`Root panel cannot be rendered as a child: ${component.componentId}`)
          }
        })}
      />
      {settings.view.componentDimensionsVisible && isActive && (
        <SizeLabel reference="bottom-right" boundingRect={computedPanel.boundingRect} />
      )}
    </>
  )
}
