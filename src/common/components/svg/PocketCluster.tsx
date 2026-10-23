import { useCallback, useId, type FC, type MouseEvent } from 'react'
import { useDrawAreaContext } from '../../contexts/DrawAreaContext'
import { useComponent } from '../../hooks/useComponent'
import { useComputedComponent } from '../../hooks/useComputedComponent'
import { useGlobalSettings } from '../../hooks/useGlobalSettings'
import { usePath } from '../../hooks/usePath'
import type { PocketClusterSchema } from '../../schemas/components'
import type { ComputedPocketClusterSchema } from '../../schemas/computed'
import type { DrawAreaComponentStyleParams } from '../../schemas/drawArea'
import { Pocket } from './Pocket'
import { PocketStitchMask } from './PocketStitchMask'
import { SizeLabel } from './SizeLabel'
import { StitchLines } from './StitchLines'

type PocketClusterProps = {
  componentId: string
  nestingLevel: number
}

export const PocketCluster: FC<PocketClusterProps> = ({ componentId, nestingLevel }) => {
  const maskId = useId()
  const { componentStyles, isInteractive, isShowingCards, selection } = useDrawAreaContext()
  const { settings } = useGlobalSettings()

  const cluster = useComponent<PocketClusterSchema>(componentId)
  const computed = useComputedComponent<ComputedPocketClusterSchema>(componentId)
  const pathData = usePath(computed.path)
  const active = selection.isSelected(cluster) || selection.isHovered(cluster)

  const style: DrawAreaComponentStyleParams = { component: cluster, nestingLevel }

  const onClick = useCallback(
    (event: MouseEvent): void => {
      event.stopPropagation()
      selection.select(cluster)
    },
    [cluster, selection],
  )

  return (
    <>
      {isShowingCards && <PocketStitchMask id={maskId} componentId={componentId} nestingLevel={nestingLevel} />}
      <g data-component-id={componentId} onClick={isInteractive ? onClick : undefined}>
        {active && (
          <path
            d={pathData}
            fill={componentStyles.getBackgroundColor(style)}
            stroke={componentStyles.getBorderColor(style)}
            strokeWidth={componentStyles.getBorderThickness(style)}
            filter={componentStyles.getFilter(style)}
          />
        )}
        {computed.children.map((pocket) => (
          <Pocket key={pocket.componentId} componentId={pocket.componentId} nestingLevel={nestingLevel} />
        ))}
      </g>
      {settings.view.componentDimensionsVisible && active && (
        <SizeLabel reference="bottom-right" boundingRect={computed.boundingRect} />
      )}
      <StitchLines componentId={componentId} maskId={isShowingCards ? maskId : undefined} />
    </>
  )
}
