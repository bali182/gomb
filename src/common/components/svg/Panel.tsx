import { useCallback, type FC, type MouseEventHandler, type PointerEventHandler } from 'react'

import { useDrawAreaContext } from '../../contexts/DrawAreaContext'
import { useComponent } from '../../hooks/useComponent'
import { useComputedComponent } from '../../hooks/useComputedComponent'
import { usePath } from '../../hooks/usePath'
import type { PanelSchema } from '../../schemas/components'
import type { ComputedPanelSchema } from '../../schemas/computed'
import type { DrawAreaComponentStyleParams } from '../../schemas/drawArea'
import { HoleHighlights } from './HoleHighlights'
import { PocketCluster } from './PocketCluster'
import { StitchLines } from './StitchLines'

type PanelProps = {
  componentId: string
  nestingLevel: number
}

export const Panel: FC<PanelProps> = ({ componentId, nestingLevel }) => {
  const { componentStyles, isInteractive, selection } = useDrawAreaContext()
  const panel = useComponent<PanelSchema>(componentId)
  const computedPanel = useComputedComponent<ComputedPanelSchema>(componentId)
  const pathData = usePath(computedPanel.path)
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

      <StitchLines componentId={panel.id} />

      <HoleHighlights componentId={panel.id} />
      {computedPanel.children.map((component) => {
        switch (component.type) {
          case 'computed-panel':
            return (
              <Panel componentId={component.componentId} key={component.componentId} nestingLevel={nestingLevel + 1} />
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
    </>
  )
}
