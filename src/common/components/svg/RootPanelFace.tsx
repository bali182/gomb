import { useMemo, type FC } from 'react'
import { SvgFaceContext, type SvgFaceContextValue, type SvgViewDirection } from '../../contexts/SvgFaceContext'
import { useSubProject } from '../../hooks/useSubProject'
import { getHorizontalReflectionTransform } from '../../logic/geometryUtils'
import { Guide } from './Guide'
import { HoleHighlights } from './HoleHighlights'
import { Panel } from './Panel'
import { PocketCluster } from './PocketCluster'
import { StitchLines } from './StitchLines'
import { SvgComponentLayers } from './SvgComponentLayers'

type RootPanelFaceProps = { componentId: string; nestingLevel: number; direction?: SvgViewDirection }
export const RootPanelFace: FC<RootPanelFaceProps> = ({ componentId, nestingLevel, direction = 'forward' }) => {
  const { computedAccessor } = useSubProject()
  const root = computedAccessor.component.rootPanel()
  const axisX = root.boundingRect.x.plus(root.boundingRect.width.dividedBy(2))
  const children = computedAccessor.component.children(componentId)
  const orderedChildren = direction === 'reverse' ? [...children].reverse() : children
  const view = useMemo<SvgFaceContextValue>(() => ({ faceId: componentId, direction }), [componentId, direction])
  return (
    <SvgFaceContext.Provider value={view}>
      <g transform={direction === 'reverse' ? getHorizontalReflectionTransform(axisX) : undefined}>
        <SvgComponentLayers
          content={
            <>
              <StitchLines componentId={componentId} surface="front" />
              <HoleHighlights componentId={componentId} />
            </>
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
              case 'computed-root-panel-face':
                throw new Error(`Root panel or face cannot be rendered as a face child: ${component.componentId}`)
            }
          })}
        />
      </g>
    </SvgFaceContext.Provider>
  )
}
