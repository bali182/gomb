import type { FC } from 'react'
import { useSubProject } from '../../hooks/useSubProject'
import { accessors } from '../../utils/accessors'
import { HoleHighlights } from './HoleHighlights'
import { Panel } from './Panel'
import { PocketCluster } from './PocketCluster'
import { StitchLines } from './StitchLines'

type RootPanelFaceProps = { componentId: string; nestingLevel: number }
export const RootPanelFace: FC<RootPanelFaceProps> = ({ componentId, nestingLevel }) => {
  const { computedSubProject } = useSubProject()
  const accessor = accessors.computedSubProject(computedSubProject)
  return (
    <>
      <StitchLines componentId={componentId} />
      <HoleHighlights componentId={componentId} />
      {accessor.component.children(componentId).map((component) => {
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
          case 'computed-root-panel-face':
            throw new Error(`Root panel or face cannot be rendered as a face child: ${component.componentId}`)
        }
      })}
    </>
  )
}
