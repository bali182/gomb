import { useCallback, useMemo, type FC, type MouseEvent } from 'react'
import { useDrawAreaContext } from '../../contexts/DrawAreaContext'
import { useSvgFace } from '../../contexts/SvgFaceContext'
import { useGlobalSettings } from '../../hooks/useGlobalSettings'
import { usePath } from '../../hooks/usePath'
import { useSubProject } from '../../hooks/useSubProject'
import type { PocketSchema } from '../../schemas/components'
import type { DrawAreaComponentBackgroundStyleParams, DrawAreaComponentStyleParams } from '../../schemas/drawArea'
import { isDefined } from '../../utils/isDefined'
import { narrowers } from '../../utils/narrowers'
import { Guide } from './Guide'
import { HoleHighlights } from './HoleHighlights'
import { Panel } from './Panel'
import { PocketCluster } from './PocketCluster'
import { PocketItem } from './PocketItem'
import { PureSvgComponent } from './PureSvgComponent'
import { SelectionPortal } from './SelectionPortal'
import { SizeLabel } from './SizeLabel'
import { StitchLines } from './StitchLines'
import { SvgComponentLayers } from './SvgComponentLayers'

type PocketProps = {
  componentId: string
  nestingLevel: number
}

export const Pocket: FC<PocketProps> = ({ componentId, nestingLevel }) => {
  const { componentStyles, selectionStyles, isInteractive, isShowingPocketItems, selection } = useDrawAreaContext()
  const { hover, clearHover, select } = selection
  const { settings } = useGlobalSettings()
  const { accessor, computedAccessor } = useSubProject()
  const computed = computedAccessor.component.pocket(componentId)
  const { direction } = useSvgFace()
  const children = narrowers.is.computedFrontPocket(computed) ? computedAccessor.component.children(componentId) : []
  const orderedChildren = direction === 'reverse' ? [...children].reverse() : children
  const path = usePath(computed.path)

  const pocket = useMemo<PocketSchema>(() => accessor.component.pocket(componentId), [accessor.component, componentId])

  const backgroundStyleParams: DrawAreaComponentBackgroundStyleParams = {
    component: pocket,
    nestingLevel,
  }
  const style: DrawAreaComponentStyleParams = { component: pocket }

  const enter = useCallback((): void => hover(pocket), [pocket, hover])

  const leave = useCallback((): void => clearHover(), [clearHover])

  const click = useCallback(
    (event: MouseEvent<SVGPathElement>): void => {
      event.stopPropagation()
      select(pocket)
    },
    [pocket, select],
  )
  const active = selection.isSelected(pocket) || selection.isHovered(pocket)
  const isHighlighted =
    active ||
    [selection.selected, selection.hovered].some((item): boolean => {
      return isDefined(item) && narrowers.is.pocketOpening(item) && item.id === pocket.openingId
    })

  return (
    <>
      <SvgComponentLayers
        before={
          isShowingPocketItems && isDefined(computed.item) && <PocketItem owner={pocket} path={computed.item.path} />
        }
        content={
          <SvgComponentLayers
            before={<StitchLines componentId={componentId} surface="back" />}
            after={<StitchLines componentId={componentId} surface="front" />}
            content={
              <>
                <PureSvgComponent
                  mode={isHighlighted ? 'hit-area' : 'normal'}
                  componentId={pocket.id}
                  path={path}
                  boundingRect={computed.boundingRect}
                  fillColor={componentStyles.getBackgroundColor(backgroundStyleParams)}
                  strokeColor={componentStyles.getBorderColor(style)}
                  strokeWidth={componentStyles.getBorderThickness(style)}
                  selectionColor={selectionStyles.getSelectionColor()}
                  disablePointerEvents={!isInteractive}
                  onPointerEnter={isInteractive ? enter : undefined}
                  onPointerLeave={isInteractive ? leave : undefined}
                  onClick={isInteractive ? click : undefined}
                />
                {isHighlighted && (
                  <SelectionPortal>
                    <PureSvgComponent
                      mode="selected"
                      componentId={pocket.id}
                      path={path}
                      boundingRect={computed.boundingRect}
                      fillColor={componentStyles.getBackgroundColor(backgroundStyleParams)}
                      strokeColor={componentStyles.getBorderColor(style)}
                      strokeWidth={componentStyles.getBorderThickness(style)}
                      selectionColor={selectionStyles.getSelectionColor()}
                    />
                  </SelectionPortal>
                )}
                <HoleHighlights componentId={componentId} />
              </>
            }
          />
        }
        after={orderedChildren.map((child) => {
          switch (child.type) {
            case 'computed-guide':
              return <Guide key={child.componentId} componentId={child.componentId} nestingLevel={nestingLevel + 1} />
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
      />
      {settings.view.componentDimensionsVisible && active && (
        <SizeLabel reference="bottom-right" boundingRect={computed.boundingRect} />
      )}
    </>
  )
}
