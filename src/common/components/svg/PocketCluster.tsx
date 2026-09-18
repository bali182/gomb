import { Fragment, useCallback, useState, type FC, type MouseEventHandler, type PointerEventHandler } from 'react'

import { useDrawAreaContext } from '../../contexts/DrawAreaContext'
import { useComponent } from '../../hooks/useComponent'
import { useComputedComponent } from '../../hooks/useComputedComponent'
import { usePath } from '../../hooks/usePath'
import type { PocketClusterSchema } from '../../schemas/components'
import type { ComputedPocketClusterSchema } from '../../schemas/computed'
import type { DrawAreaComponentStyleParams } from '../../schemas/drawArea'
import { isDefined } from '../../utils/isDefined'
import { Card } from './Card'
import { HoleHighlights } from './HoleHighlights'
import { Panel } from './Panel'
import { StitchLines } from './StitchLines'
import { TPocket } from './TPocket'
import { TPocketStitchLines } from './TPocketStitchLines'

type PocketClusterProps = {
  componentId: string
  nestingLevel: number
}

export const PocketCluster: FC<PocketClusterProps> = ({ componentId, nestingLevel }) => {
  const { componentStyles, isInteractive, isShowingCards, selection } = useDrawAreaContext()
  const [isHovered, setIsHovered] = useState(false)
  const pocketCluster = useComponent<PocketClusterSchema>(componentId)
  const computedPocketCluster = useComputedComponent<ComputedPocketClusterSchema>(componentId)
  const pathData = usePath(computedPocketCluster.path)
  const frontPocketPathData = usePath(computedPocketCluster.frontPocket.path)
  const isSelected = selection.isComponentSelected(pocketCluster.id) || isHovered
  const clusterStyleParams: DrawAreaComponentStyleParams = {
    component: pocketCluster,
    isHovered,
    nestingLevel,
  }

  const handlePointerEnter = useCallback<PointerEventHandler<SVGGElement>>(() => {
    setIsHovered(true)
  }, [])
  const handlePointerLeave = useCallback<PointerEventHandler<SVGGElement>>(() => {
    setIsHovered(false)
  }, [])
  const handleClick = useCallback<MouseEventHandler<SVGGElement>>(
    (event) => {
      event.stopPropagation()
      selection.selectComponent(pocketCluster.id)
    },
    [pocketCluster.id, selection],
  )

  return (
    <>
      <g
        data-component-id={pocketCluster.id}
        onClick={isInteractive ? handleClick : undefined}
        onPointerEnter={isInteractive ? handlePointerEnter : undefined}
        onPointerLeave={isInteractive ? handlePointerLeave : undefined}
      >
        {isSelected && (
          <path
            d={pathData}
            fill={componentStyles.getBackgroundColor(clusterStyleParams)}
            filter={componentStyles.getFilter(clusterStyleParams)}
            stroke={componentStyles.getBorderColor(clusterStyleParams)}
            strokeWidth={componentStyles.getBorderThickness(clusterStyleParams)}
          />
        )}
        {computedPocketCluster.tPockets.map((pocket, pocketIndex) => {
          return (
            <Fragment key={pocket.id}>
              {isShowingCards && isDefined(pocket.card) && (
                <Card isParentHovered={isHovered} owner={pocketCluster} path={pocket.card.path} />
              )}
              <TPocket
                fill={componentStyles.getBackgroundColor(clusterStyleParams)}
                path={pocket.path}
                stroke={componentStyles.getBorderColor(clusterStyleParams)}
                strokeWidth={componentStyles.getBorderThickness(clusterStyleParams)}
              />
              <TPocketStitchLines componentId={pocketCluster.id} pocketIndex={pocketIndex} />
            </Fragment>
          )
        })}

        {isShowingCards && isDefined(computedPocketCluster.frontPocket.card) && (
          <Card isParentHovered={isHovered} owner={pocketCluster} path={computedPocketCluster.frontPocket.card.path} />
        )}
        <path
          d={frontPocketPathData}
          fill={componentStyles.getBackgroundColor(clusterStyleParams)}
          stroke={componentStyles.getBorderColor(clusterStyleParams)}
          strokeWidth={componentStyles.getBorderThickness(clusterStyleParams)}
        />
      </g>
      <StitchLines componentId={pocketCluster.id} />
      <HoleHighlights componentId={pocketCluster.id} />
      {computedPocketCluster.children.map((component) => {
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
