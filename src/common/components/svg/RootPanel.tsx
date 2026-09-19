import { useCallback, type FC, type MouseEventHandler, type PointerEventHandler } from 'react'

import { useDrawAreaContext } from '../../contexts/DrawAreaContext'
import { useComponent } from '../../hooks/useComponent'
import { useComputedComponent } from '../../hooks/useComputedComponent'
import { usePath } from '../../hooks/usePath'
import type { RootPanelSchema } from '../../schemas/components'
import type { ComputedRootPanelSchema } from '../../schemas/computed'
import type { DrawAreaComponentStyleParams } from '../../schemas/drawArea'
import { HoleHighlights } from './HoleHighlights'
import { Panel } from './Panel'
import { PocketCluster } from './PocketCluster'
import { StitchLines } from './StitchLines'

type RootPanelProps = {
  componentId: string
  nestingLevel: number
}

export const RootPanel: FC<RootPanelProps> = ({ componentId, nestingLevel }) => {
  const { componentStyles, isInteractive, selection } = useDrawAreaContext()
  const rootPanel = useComponent<RootPanelSchema>(componentId)
  const computedRootPanel = useComputedComponent<ComputedRootPanelSchema>(componentId)
  const pathData = usePath(computedRootPanel.path)
  const styleParams: DrawAreaComponentStyleParams = {
    component: rootPanel,
    nestingLevel,
  }

  const handlePointerEnter = useCallback<PointerEventHandler<SVGPathElement>>(() => {
    selection.hover(rootPanel)
  }, [rootPanel, selection])
  const handlePointerLeave = useCallback<PointerEventHandler<SVGPathElement>>(() => {
    selection.clearHover()
  }, [selection])
  const handleClick = useCallback<MouseEventHandler<SVGPathElement>>(
    (event) => {
      event.stopPropagation()
      selection.select(rootPanel)
    },
    [rootPanel, selection],
  )

  return (
    <>
      <path
        d={pathData}
        fill={componentStyles.getBackgroundColor(styleParams)}
        filter={componentStyles.getFilter(styleParams)}
        stroke={componentStyles.getBorderColor(styleParams)}
        strokeWidth={componentStyles.getBorderThickness(styleParams)}
        data-component-id={rootPanel.id}
        onPointerEnter={isInteractive ? handlePointerEnter : undefined}
        onPointerLeave={isInteractive ? handlePointerLeave : undefined}
        onClick={isInteractive ? handleClick : undefined}
      />

      <StitchLines componentId={rootPanel.id} />

      <HoleHighlights componentId={rootPanel.id} />
      {computedRootPanel.children.map((component) => {
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
