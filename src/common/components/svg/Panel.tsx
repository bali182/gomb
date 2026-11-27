import { useCallback, useMemo, type FC, type MouseEventHandler, type PointerEventHandler } from 'react'
import { Guide } from './Guide'

import { useDrawAreaContext } from '../../contexts/DrawAreaContext'
import { useSvgFace } from '../../contexts/SvgFaceContext'
import { useGlobalSettings } from '../../hooks/useGlobalSettings'
import { usePath } from '../../hooks/usePath'
import { useSubProject } from '../../hooks/useSubProject'
import type { PanelSchema } from '../../schemas/components'
import type { ComputedPanelSchema } from '../../schemas/computed'
import type { DrawAreaComponentBackgroundStyleParams, DrawAreaComponentStyleParams } from '../../schemas/drawArea'
import { HoleHighlights } from './HoleHighlights'
import { PocketCluster } from './PocketCluster'
import { SelectionShadow, type SelectionShadowPath } from './SelectionShadow'
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
  const path = usePath(computedPanel.path)

  const panel = useMemo(() => accessor.component.panel(componentId), [accessor.component, componentId])

  const isActive = selection.isSelected(panel) || selection.isHovered(panel)
  const backgroundStyleParams: DrawAreaComponentBackgroundStyleParams = {
    component: panel,
    nestingLevel,
  }
  const styleParams: DrawAreaComponentStyleParams = { component: panel }

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
                {isActive && <PanelSelectionShadow model={panel} computedModel={computedPanel} path={path} />}
                <path
                  d={path}
                  fill={componentStyles.getBackgroundColor(backgroundStyleParams)}
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

type PanelSelectionShadowProps = {
  model: PanelSchema
  computedModel: ComputedPanelSchema
  path: string
}

const PanelSelectionShadow: FC<PanelSelectionShadowProps> = ({ model, computedModel, path }) => {
  const { componentStyles, selectionStyles } = useDrawAreaContext()
  const paths = useMemo<SelectionShadowPath[]>(
    () => [{ path, strokeWidth: componentStyles.getBorderThickness({ component: model }) ?? 1 }],
    [path, componentStyles, model],
  )

  return (
    <SelectionShadow
      paths={paths}
      boundingRect={computedModel.boundingRect}
      color={selectionStyles.getSelectionColor()}
    />
  )
}
