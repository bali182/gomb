import { useCallback, useMemo, type FC, type MouseEvent } from 'react'
import { Guide } from './Guide'

import { useDrawAreaContext } from '../../contexts/DrawAreaContext'
import { useSvgFace } from '../../contexts/SvgFaceContext'
import { useGlobalSettings } from '../../hooks/useGlobalSettings'
import { usePath } from '../../hooks/usePath'
import { useSubProject } from '../../hooks/useSubProject'
import type { PanelSchema } from '../../schemas/components'
import type { DrawAreaComponentBackgroundStyleParams, DrawAreaComponentStyleParams } from '../../schemas/drawArea'
import { HoleHighlights } from './HoleHighlights'
import { PocketCluster } from './PocketCluster'
import { PureSvgComponent } from './PureSvgComponent'
import { SelectionPortal } from './SelectionPortal'
import { SizeLabel } from './SizeLabel'
import { StitchLines } from './StitchLines'
import { SvgComponentLayers } from './SvgComponentLayers'

type PanelProps = {
  componentId: string
  nestingLevel: number
}

export const Panel: FC<PanelProps> = ({ componentId, nestingLevel }) => {
  const { componentStyles, selectionStyles, isInteractive, selection } = useDrawAreaContext()
  const { hover, clearHover, select } = selection
  const { settings } = useGlobalSettings()
  const { accessor, computedAccessor } = useSubProject()
  const computedPanel = computedAccessor.component.panel(componentId)
  const { direction } = useSvgFace()
  const children = computedAccessor.component.children(componentId)
  const orderedChildren = direction === 'reverse' ? [...children].reverse() : children
  const path = usePath(computedPanel.path)

  const panel = useMemo<PanelSchema>(() => accessor.component.panel(componentId), [accessor.component, componentId])

  const isActive = selection.isSelected(panel) || selection.isHovered(panel)
  const backgroundStyleParams: DrawAreaComponentBackgroundStyleParams = {
    component: panel,
    nestingLevel,
  }
  const styleParams: DrawAreaComponentStyleParams = { component: panel }

  const handlePointerEnter = useCallback((): void => {
    hover(panel)
  }, [panel, hover])

  const handlePointerLeave = useCallback((): void => {
    clearHover()
  }, [clearHover])

  const handleClick = useCallback(
    (event: MouseEvent<SVGPathElement>): void => {
      event.stopPropagation()
      select(panel)
    },
    [panel, select],
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
                <PureSvgComponent
                  mode={isActive ? 'hit-area' : 'normal'}
                  componentId={panel.id}
                  path={path}
                  boundingRect={computedPanel.boundingRect}
                  fillColor={componentStyles.getBackgroundColor(backgroundStyleParams)}
                  strokeColor={componentStyles.getBorderColor(styleParams)}
                  strokeWidth={componentStyles.getBorderThickness(styleParams)}
                  selectionColor={selectionStyles.getSelectionColor()}
                  disablePointerEvents={!isInteractive}
                  onPointerEnter={isInteractive ? handlePointerEnter : undefined}
                  onPointerLeave={isInteractive ? handlePointerLeave : undefined}
                  onClick={isInteractive ? handleClick : undefined}
                />
                {isActive && (
                  <SelectionPortal>
                    <PureSvgComponent
                      mode="selected"
                      componentId={panel.id}
                      path={path}
                      boundingRect={computedPanel.boundingRect}
                      fillColor={componentStyles.getBackgroundColor(backgroundStyleParams)}
                      strokeColor={componentStyles.getBorderColor(styleParams)}
                      strokeWidth={componentStyles.getBorderThickness(styleParams)}
                      selectionColor={selectionStyles.getSelectionColor()}
                    />
                  </SelectionPortal>
                )}
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
