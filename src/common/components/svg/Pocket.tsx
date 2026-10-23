import { useCallback, type FC, type MouseEventHandler, type PointerEventHandler } from 'react'
import { useDrawAreaContext } from '../../contexts/DrawAreaContext'
import { useComponent } from '../../hooks/useComponent'
import { useComputedComponent } from '../../hooks/useComputedComponent'
import { useGlobalSettings } from '../../hooks/useGlobalSettings'
import { usePath } from '../../hooks/usePath'
import type { PocketSchema } from '../../schemas/components'
import type { ComputedPocketSchema } from '../../schemas/computed'
import type { DrawAreaComponentStyleParams } from '../../schemas/drawArea'
import { isDefined } from '../../utils/isDefined'
import { Card } from './Card'
import { HoleHighlights } from './HoleHighlights'
import { Panel } from './Panel'
import { PocketCluster } from './PocketCluster'
import { SizeLabel } from './SizeLabel'
import { StitchLines } from './StitchLines'
import { TPocketStitchLines } from './TPocketStitchLines'

type PocketProps = {
  componentId: string
  nestingLevel: number
}

export const Pocket: FC<PocketProps> = ({ componentId, nestingLevel }) => {
  const { componentStyles, isInteractive, isShowingCards, selection } = useDrawAreaContext()
  const { settings } = useGlobalSettings()
  const pocket = useComponent<PocketSchema>(componentId)
  const computed = useComputedComponent<ComputedPocketSchema>(componentId)
  const pathData = usePath(computed.path)

  const style: DrawAreaComponentStyleParams = {
    component: pocket,
    nestingLevel,
  }

  const enter = useCallback<PointerEventHandler<SVGPathElement>>(() => selection.hover(pocket), [pocket, selection])

  const leave = useCallback<PointerEventHandler<SVGPathElement>>(() => selection.clearHover(), [selection])

  const click = useCallback<MouseEventHandler<SVGPathElement>>(
    (event) => {
      event.stopPropagation()
      selection.select(pocket)
    },
    [pocket, selection],
  )
  const active = selection.isSelected(pocket) || selection.isHovered(pocket)

  return (
    <>
      {isShowingCards && isDefined(computed.card) && <Card owner={pocket} path={computed.card.path} />}
      <path
        d={pathData}
        data-component-id={componentId}
        fill={componentStyles.getBackgroundColor(style)}
        stroke={componentStyles.getBorderColor(style)}
        strokeWidth={componentStyles.getBorderThickness(style)}
        filter={componentStyles.getFilter(style)}
        onPointerEnter={isInteractive ? enter : undefined}
        onPointerLeave={isInteractive ? leave : undefined}
        onClick={isInteractive ? click : undefined}
      />
      {pocket.type === 't-pocket' && <TPocketStitchLines componentId={componentId} />}
      <StitchLines componentId={componentId} />
      <HoleHighlights componentId={componentId} />
      {settings.view.componentDimensionsVisible && active && (
        <SizeLabel reference="bottom-right" boundingRect={computed.boundingRect} />
      )}
      {computed.type === 'computed-front-pocket' &&
        computed.children.map((child) => {
          switch (child.type) {
            case 'computed-panel':
              return <Panel key={child.componentId} componentId={child.componentId} nestingLevel={nestingLevel + 1} />
            case 'computed-pocket-cluster':
              return (
                <PocketCluster
                  key={child.componentId}
                  componentId={child.componentId}
                  nestingLevel={nestingLevel + 1}
                />
              )
            default:
              return undefined
          }
        })}
    </>
  )
}
